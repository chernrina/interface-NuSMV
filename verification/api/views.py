from rest_framework import status
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate,login

from .serializers import UserSerializer,ProjectSerializer,ProjectsSerializer, Structure
from ..models import Projects
from django.contrib.auth.models import User

from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator

import re
import subprocess
import os

import time
from datetime import datetime


class UserViewSet(viewsets.ModelViewSet):

	queryset = User.objects.all()
	serializer_class = UserSerializer


class ProjectViewSet(viewsets.ModelViewSet):

	queryset = Projects.objects.all()
	serializer_class = ProjectSerializer

class ProjectsViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectsSerializer
    queryset = Projects.objects.all()

    def get(self, request, *args, **kwargs):
        username = kwargs.get('user','')
        userId = User.objects.filter(username=username).first()
        if userId:
            queryset = Projects.objects.filter(author=userId) 
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response([])

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        username = request.data['user']
        userId = User.objects.filter(username=username).first()
        if userId:
            queryset = Projects.objects.filter(author=userId) 
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response([])

class UserIdViewSet(viewsets.ModelViewSet):

    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get(self, request, *args, **kwargs):
        username = kwargs.get('user','')
        queryset = User.objects.filter(username=username)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
       
class getProjectViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectSerializer
    queryset = Projects.objects.all()

    def get(self, request, *args, **kwargs):
        username = kwargs.get('user','')
        projectname = kwargs.get('project','')
        userId = User.objects.filter(username=username).first()
        if userId:
            queryset = Projects.objects.filter(author=userId).filter(title=projectname) 
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        return Response([])

    @method_decorator(csrf_protect)
    def post(self, request, *args, **kwargs):
        data = request.data
        queryset = Projects.objects.filter(title=data['title']).filter(author=data['author']).first()
        if queryset:
            queryset.input_file = data['input_file']
            queryset.save()
        else:
            user = User.objects.filter(id=data['author']).first()
            newProject = Projects.objects.create(title=data['title'],author=user,input_file=data['input_file'],output_file=data['output_file'])
            newProject.save()
        return Response([])

@api_view(('POST',))
def create_smv_file(request,username,projectname):
    params = request.data
    userId = User.objects.filter(username=username).first()
    if userId:
        queryset = Projects.objects.filter(author=userId).filter(title=projectname).first()
        if queryset:
            condition = {}
            content = ""
            data = params["moduls"]
            for module in data:
                content += "MODULE {}".format(module["name"])
                if len(module["input"]) != 0:
                    content += module["input"] 
                content += "\n"

                content += "VAR\n"
                if len(module["var"]) != 0:
                    for input_param in module["var"]:
                        if input_param["type"] == "array":
                            content += "{} : {} 1 .. {} of {};\n".format(input_param["name"],input_param["type"],input_param["indexes"],input_param["typeArray"])
                        elif input_param["type"] == "process":
                            content += "{} : {} {};\n".format(input_param["name"],input_param["type"],input_param["value"]) 
                        elif input_param["type"] == "boolean":
                            content += "{} : {};\n".format(input_param["name"],input_param["type"])
                        else:
                            content += "{} : {};\n".format(input_param["name"],input_param["value"])
                content += "\n"

                
                if len(module["define"]) != 0:
                    content += "DEFINE\n"
                    for input_param in module["define"]:
                        content += "{} := {}  ;\n".format(input_param["name"],input_param["value"])
                content += "\n"

                content += "ASSIGN\n"
                if len(module["var"])!= 0:
                    for input_param in module["var"]:
                        if len(input_param["assign"]) != 0 :
                            for var in input_param["assign"]:
                                content += "{};\n".format(var) 
                content += "\n"

                if len(module["content"]) != 0:
                    for elem in module["content"]:
                        for input_param in elem["graph"]["edges"]:
                            cond = ""

                            elemVar = elem["name"]
                            if elem["name"] not in condition.keys():
                                condition[elem["name"]] = []
                            
                            if elem["name"] != input_param["from"]:
                                cond += elem["name"] + " = " +  input_param["from"]


                            if input_param["label"] != "":
                                if cond != "":
                                    cond += ' & ' 
                                cond += input_param["label"] 

                            cond += ' : { '

                            flag = False
                            for i in range(len(condition[elemVar])):
                                if condition[elemVar][i].find(cond) != -1:
                                    condition[elemVar][i] += ', ' + input_param["to"]
                                    cond = ""
                                    flag = True
                                    break


                            if not flag:
                                cond += input_param["to"]
                                
                            
                            if cond != "":
                                condition[elemVar].append(cond)

                    for elem in condition.keys():
                        content += 'next({}) := case\n'.format(elem)
                        for i in range(len(condition[elem])):
                            content += '\t {} '.format(condition[elem][i]) + '};\n'
                        content += '\t TRUE : {};\n'.format(elem)
                        content += 'esac;\n'
                        
                            
                
                if module["name"] == "main":
                    for input_param in module["spec"]:
                        content += "{} \n {};\n".format(input_param["type"], input_param["content"])

            
            queryset.input_file = content
            queryset.save()
        else:
            return Response("No such project",status=status.HTTP_404_NOT_FOUND)
    else:
        return Response("No such user",status=status.HTTP_404_NOT_FOUND)
    return Response(content)



@api_view(('POST',))
def launch(request):
    checkProcesses()
    user = request.data['user']
    project = request.data['project']
    userId = User.objects.filter(username=user).first()
    if userId:
        query = Projects.objects.filter(author=userId).get(title=project)
        file = query.input_file
        filename = 'projects\\' + user + project + 'input.smv'
        check = os.path.exists(filename)
        if check:
            return Response({"text": "Wait for the last result","structure":[]})
        with open(filename,"w") as f:
            f.write(file)
        try:
            ans = subprocess.check_output(["nusmv", filename],shell=True, stderr=subprocess.STDOUT).decode()
            #time.sleep(10)
        except subprocess.CalledProcessError as e:
            os.remove(filename)
            find = re.findall(r'(line.*\n)',e.stdout.decode())
            return Response({"text":"Error code: {} {}".format(e.returncode,find[0]),"structure":[]})

        res,data = visualization(ans)

        query.output_file = res
        current_time = datetime.now().strftime("%d-%m-%Y %H:%M")
        query.last_time = current_time
        query.save()
        os.remove(filename)
        return Response({"text":res,"structure":data,"time":current_time})
    return Response("No such user", status=status.HTTP_404_NOT_FOUND)

def checkProcesses():
    path = os.getcwd()
    files = os.listdir(path + '\\projects')
    print(len(files))


@api_view(('POST',))
def getVisualization(request):
    data = request.data['data']
    res,ans = visualization(data)
    return Response(ans)

def visualization(text):
    ans = []
    counter_examples = re.findall(r'--(([^--].+\n)+)',text)
    res=""
    

    for elem in counter_examples:
        res += '--' + elem[0]
        spec = re.findall(r'specification (.*) is (\w+)',elem[0])
        if len(spec) != 0:
            ans.append({"spec":spec[0][0].rstrip().lstrip() ,"res":spec[0][1],"example":{"state":[],"input":[]}})
        example = re.findall(r'as demonstrated.*',elem[0])
        if len(example) != 0:
            elements = elem[0].split('-> Input')
            step = 0
            for element in elements:
                
                find_inp = r'(^:.*)((\n.*=.*)+)(\n.*--.*)?'
                inputs = re.findall(find_inp,element)
                if len(inputs) == 0:
                    ans[-1]["example"]["input"].append({"step":step,"inputs":[],"loop":0})

                for element1 in inputs:
                    conditions = element1[1].replace(" ","").replace("\r","").split('\n')
                    loop = element1[3].replace(" ","").replace("\r","").replace('\n',"")
                    ans[-1]["example"]["input"].append({"step":step,"inputs":[],"loop":0})
                    for cond in conditions:
                        if cond == '':
                            continue
                        ans[-1]["example"]["input"][-1]["inputs"].append({"name":cond.split('=')[0],"value":cond.split('=')[1]})
                        break
                    if loop != '':
                        ans[-1]["example"]["input"][-1]["loop"] = 1


                find_state = r'(.*State.*)((\n.*=.*)+)'
                states = re.findall(find_state,element)
                if len(states) == 0:
                    ans[-1]["example"]["state"].append({"step":step,"states":[]})
                else:
                    for element1 in states:
                        conditions = element1[1].replace(" ","").replace("\r","").split('\n')
                        ans[-1]["example"]["state"].append({"step":step,"states":[]})
                        for cond in conditions:
                            if cond == '':
                                continue
                            ans[-1]["example"]["state"][-1]["states"].append({"name":cond.split('=')[0],"value":cond.split('=')[1]})


                step += 1

    return (res,ans)
    

@api_view(('POST',))
def parse_smv_file(request):
    try:
        username1 = request.data['user']
        projectname1 = request.data['project']
    except:
        return Response("Not found params",status=status.HTTP_404_NOT_FOUND)
    userId = User.objects.filter(username=username1).first()
    file = ""
    if userId:
        queryset = Projects.objects.filter(author=userId).get(title=projectname1)
        file = queryset.input_file
    if file == "":
        return Response([])
    moduls = [{
        "name": "main",
        "open": True,
        "content": [],
        "input": "",
        "var": [],
        "define": [],
        "constants":[],
        "spec": []
    }]
    moduls_parse = re.findall(r'MODULE ((.*)([^MODULE].*\n)+)', file)
    params_module = []
    for pair in moduls_parse:
        inp = ""
        if pair[1].replace("\r","") != "main":
            input_params_module = re.findall(r'(.*)(\(.*\))',pair[1])

            moduls.append({
                "name": input_params_module[0][0],
                "open": False,
                "content": [],
                "input": inp,
                "var": [],
                "define": [],
                "constants":[]
            })
            
            if len(input_params_module[0]) != 1:
                inp = input_params_module[0][1]
                moduls[-1]["input"] = inp
                params = inp.replace("(","").replace(")","").replace(" ","").split(',')
                for param in params_module:
                    if param["name"] == input_params_module[0][0]:
                        for var in param["params"]:

                            moduls[-1]["content"].append({
                                "name":params[var["ind"]],
                                "globalname":var["var"]["name"],
                                "graph": {
                                    "nodes": [],
                                    "edges": []
                                }
                                })

                            var["ind"] = params[var["ind"]]

                            if var["var"]["type"] == "boolean":
                                moduls[-1]["content"][-1]["graph"]["nodes"].append({"id":"TRUE","label":"TRUE"})
                                moduls[-1]["content"][-1]["graph"]["nodes"].append({"id":"FALSE","label":"FALSE"})
                            else:
                                for elem in var["var"]["value"].replace("{","").replace("}","").split(','):

                                    moduls[-1]["content"][-1]["graph"]["nodes"].append({"id":elem,"label":elem})

                        break

            
        vars_parse = re.findall(r'(.*VAR.*)((\n.*:.*)+)',pair[0])
        nodes = []
        for pairVar in vars_parse:
            var = pairVar[1].replace(" ","").replace("\n","").replace("\r","").split(';')
            
            for elem in var:
                ans = {}
                options = elem.split(":")
                if options[0] == '':
                    break
                ans["name"] = options[0].replace('\t','')
                moduls[-1]["content"].append({
                        "name":ans["name"],
                        "globalname": ans["name"],
                        "graph":{
                            "nodes":[],
                            "edges":[]
                        }
                        })
                if options[1].find("array") != -1:
                    ans["type"] = "array"
                    type_array = re.findall(r'(\w+)of([\{\w,\}]+)',options[1])
                    ans["indexes"] = type_array[0][0]
                    if "boolean" not in type_array[0][1]:
                        ans["value"] = type_array[0][1]
                    else:
                        ans["typeArray"] = type_array[0][1] 
                        ans["value"] = ""
                elif options[1].find("process") != -1:
                    ans["type"] = "process"
                    type_process = re.findall(r'process(.*)',options[1])
                    ans["value"] = type_process[0].replace(";","")
                    name_proc = type_process[0].replace(')',"").split('(')[0]
                    params = type_process[0].replace(')',"").split('(')[1].split(',')
                    find = False
                    for name in params_module:
                        if name_proc == name["name"]:
                            find = True
                            break
                    if not find:
                        params_module.append({"name":name_proc,"params":[]})
                        for param_elem in params:
                            find = False
                            for module in moduls:
                                for var in module["var"]:
                                    if var["name"] == param_elem:
                                        ind = params.index(var["name"])
                                        params_module[-1]["params"].append({"ind": ind,"var":var})
                                        find = True
                                        break
                                if find:
                                    break
                            if not find:
                                ind = params.index(param_elem)
                                params_module[-1]["params"].append({"ind": ind,'var': {'name': param_elem, 'type': '', 'value': '', 'assign': []}})



                        #for module in moduls:
                         #   for var in module["var"]:
                          #      if var["name"] in params:
                           #         ind = params.index(var["name"])
                            #        params_module[-1]["params"].append({"ind": ind,"var":var})
                elif options[1].find("boolean") != -1:
                    ans["type"] = "boolean"
                    ans["value"] = ""
                    moduls[-1]["content"][-1]["graph"]["nodes"].append({"id":"TRUE","label":"TRUE"})
                    moduls[-1]["content"][-1]["graph"]["nodes"].append({"id":"FALSE","label":"FALSE"})
                else:
                    typeOfVar = options[1].replace("{","").replace("}","").replace(" ","").split(',')
                    try:
                        if type(int(typeOfVar[0])) is int:
                            ans["type"] = "integer"
                    except:
                        ans["type"] = "state"
                    ans["value"] = options[1].replace(";","")
                    
                    for elem in ans["value"].replace("{","").replace("}","").split(','):
                        moduls[-1]["content"][-1]["graph"]["nodes"].append({"id":elem,"label":elem})
                        nodes.append(elem)
                    
                ans["assign"] = []
                moduls[-1]["var"].append(ans)
            
            
        define_parse = re.findall(r'(.*DEFINE.*)((\n.*:.*)+)',pair[0])
        for pairDefine in define_parse:
            var = pairDefine[1].replace(" ","").replace("\n","").replace("\r","").split(';')
            
            for elem in var:
                ans = {}
                options = elem.split(":=")
                if options[0] == '':
                    break
                ans["name"] = options[0]
                ans["value"] = options[1].replace(";","")
                moduls[-1]["define"].append(ans)

        const_parse = re.findall(r'(.*CONSTANTS.*)((\n.*:.*)+)',pair[0])
        for pairDefine in const_parse:
            var = pairDefine[1].replace(" ","").replace("\n","").replace("\r","").split(';')
            
            for elem in var:
                ans = {}
                options = elem.split(":")
                if options[0] == '':
                    break
                ans["name"] = options[0]
                ans["value"] = options[1].replace(";","")
                moduls[-1]["constants"].append(ans)

        assign_parse = re.findall(r'(init(.*));',pair[0])
        for pairInit in assign_parse:
            var = pairInit[1].replace(" ","").replace("\n","").replace("\r","").split(':=')[0]
            element = var[1:-1].split('[')
            for i in moduls[-1]["var"]:
                if i["name"] == element[0]:
                    i["assign"].append(pairInit[0])
                    break

        assign_parse = re.findall(r'(next(.*):=(.*\n)+)',pair[0])
        
        if len(assign_parse) != 0:
            assign_parse = assign_parse[0][0].replace(" ","").replace('\r',"").split("esac;")
            for i in assign_parse:
                nameVar = re.findall(r'next\((.*)\):=',i)

                value = []
                ind = -1
                if len(nameVar) != 0:
                    for j in range(len(moduls[-1]["content"])):
                        if moduls[-1]["content"][j]["name"] == nameVar[0]:
                            ind = j
                            break
                        

                elems = i.split('\n')
                for elem in elems:
                    if elem == '' or len(re.findall(r'next\((.*)\):=',elem)) != 0 or len(nameVar)==0:
                        continue
                    if elem.find(nameVar[0]) != -1:
                        idNode = re.findall(nameVar[0] + r'=(\w+)', elem)
                        if len(idNode) != 0:
                            if ind == -1 and idNode[0] not in nodes:
                                nodes.append(idNode[0])
                                moduls[-1]["content"][ind]["graph"]["nodes"].append({"id":idNode[0],"label":idNode[0]})
                            condition = re.findall(r'[&|](.*):',elem)

                            toNode = re.findall(r':[{]?((\w+[,\[\]]?)+)[}]?;',elem)
                            for pair in toNode:
                                for toId in pair[0].split(','):
                                    if len(condition) != 0:
                                        moduls[-1]["content"][ind]["graph"]["edges"].append({"from":idNode[0],"to":toId,"label":condition[0]})
                                    else:
                                        moduls[-1]["content"][ind]["graph"]["edges"].append({"from":idNode[0],"to":toId,"label":""})
                        
                    else:           
                        condition = re.findall(r'(.*):[{]?((\w+[,\[\]\+\-*/]?)+)[}]?;',elem)
                        if len(condition) == 0:
                            continue
                        for idTo in condition[0][1].split(','):
                            for idFrom in moduls[-1]["content"][ind]["graph"]["nodes"]:
                                if idFrom["id"] != idTo:
                                    moduls[-1]["content"][ind]["graph"]["edges"].append({"from":idFrom["id"],"to":idTo,"label":condition[0][0]})



    spec_parse = re.findall(r'(.*SPEC).*\n(.*);',file)
    for pairSpec in spec_parse:
        moduls[0]["spec"].append({
                    "type":pairSpec[0].replace("\r","").replace(" ",""),
                    "content":pairSpec[1].replace("\r","")
                })

    return Response(moduls)
	

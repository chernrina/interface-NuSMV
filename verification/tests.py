from django.test import TestCase, RequestFactory
from rest_framework.test import APIRequestFactory
from .models import Projects
from django.contrib.auth.models import User
from .api.views import ProjectsViewSet, getProjectViewSet, launch, parse_smv_file, create_smv_file
import json


input_file = "MODULE main\r\n  VAR\r\n    proc1WantsToEnter: boolean;\r\n    proc2WantsToEnter: boolean;\t\r\n    proc1 : process proc(proc1WantsToEnter, proc2WantsToEnter);\r\n    proc2 : process proc(proc2WantsToEnter, proc1WantsToEnter);\r\n  ASSIGN\r\n    init(proc1WantsToEnter) := FALSE;\r\n    init(proc2WantsToEnter) := FALSE;\r\n\r\n  LTLSPEC  -- Взаимное исключение\r\n       G ! (proc1.state = critical & proc2.state = critical);\r\n  LTLSPEC  -- Отсутствие дедлока\r\n       NAME NoDed := ! F G((proc1.state = entering2) & (proc2.state = entering2));\r\n\r\nMODULE proc(First, Second)\r\n  VAR\r\n    state : {normal, critical, entering1, entering2, leaving};\r\n  ASSIGN\r\n    init(state) := entering1;\r\n    next(state) :=\r\n      case\r\n		state = entering1 \t\t  : entering2;\r\n		(state = entering2) & (Second)    : entering2;\r\n		(state = entering2) & (!Second)   : critical;\r\n		state = critical				  : {critical, leaving};\r\n		state = leaving				   : normal;\r\n		state = normal				    : {normal, entering1};\r\n		TRUE						      : state;\r\n     esac;\r\n   next(First) :=\r\n    case\r\n      state = entering1  : TRUE;\r\n      state = leaving    : FALSE;\r\n      TRUE\t \t : First;\r\n    esac;\r\n  FAIRNESS\r\n    running\r\n\r\n"
output_file = "-- specification  G !(proc1.state = critical & proc2.state = critical)  is true\r\n-- specification !( F ( G (proc1.state = entering2 & proc2.state = entering2)))  is false\r\n-- as demonstrated by the following execution sequence\r\nTrace Description: LTL Counterexample \r\nTrace Type: Counterexample \r\n  -> State: 1.1 <-\r\n    proc1WantsToEnter = FALSE\r\n    proc2WantsToEnter = FALSE\r\n    proc1.state = entering1\r\n    proc2.state = entering1\r\n  -> Input: 1.2 <-\r\n    _process_selector_ = proc1\r\n    running = FALSE\r\n    proc2.running = FALSE\r\n    proc1.running = TRUE\r\n  -> State: 1.2 <-\r\n    proc1WantsToEnter = TRUE\r\n    proc1.state = entering2\r\n  -> Input: 1.3 <-\r\n    _process_selector_ = proc2\r\n    proc2.running = TRUE\r\n    proc1.running = FALSE\r\n  -- Loop starts here\r\n  -> State: 1.3 <-\r\n    proc2WantsToEnter = TRUE\r\n    proc2.state = entering2\r\n  -> Input: 1.4 <-\r\n    _process_selector_ = main\r\n    running = TRUE\r\n    proc2.running = FALSE\r\n  -- Loop starts here\r\n  -> State: 1.4 <-\r\n  -> Input: 1.5 <-\r\n    _process_selector_ = proc1\r\n    running = FALSE\r\n    proc1.running = TRUE\r\n  -- Loop starts here\r\n  -> State: 1.5 <-\r\n  -> Input: 1.6 <-\r\n    _process_selector_ = proc2\r\n    proc2.running = TRUE\r\n    proc1.running = FALSE\r\n  -- Loop starts here\r\n  -> State: 1.6 <-\r\n  -> Input: 1.7 <-\r\n    _process_selector_ = main\r\n    running = TRUE\r\n    proc2.running = FALSE\r\n  -> State: 1.7 <-\r\n"
visualization_file = [
		{
		    "spec": "G !(proc1.state = critical & proc2.state = critical)",
		    "res": "true",
		    "example": {
				"state": [],
				"input": []
		    }
		},
		{
		    "spec": "!( F ( G (proc1.state = entering2 & proc2.state = entering2)))",
		    "res": "false",
		    "example": {
				"state": [
				    {
						"step": 0,
						"states": [
						    {
								"name": "proc1WantsToEnter",
								"value": "FALSE"
						    },
						    {
								"name": "proc2WantsToEnter",
								"value": "FALSE"
						    },
						    {
								"name": "proc1.state",
								"value": "entering1"
						    },
						    {
								"name": "proc2.state",
								"value": "entering1"
						    }
						]
				    },
				    {
						"step": 1,
						"states": [
						    {
								"name": "proc1WantsToEnter",
								"value": "TRUE"
						    },
						    {
								"name": "proc1.state",
								"value": "entering2"
						    }
						]
				    },
				    {
						"step": 2,
						"states": [
						    {
								"name": "proc2WantsToEnter",
								"value": "TRUE"
						    },
						    {
								"name": "proc2.state",
								"value": "entering2"
						    }
						]
				    },
				    {
						"step": 3,
						"states": []
				    },
				    {
						"step": 4,
						"states": []
				    },
				    {
						"step": 5,
						"states": []
				    },
				    {
						"step": 6,
						"states": []
				    }
				],
				"input": [
				    {
						"step": 0,
						"inputs": [],
						"loop": 0
				    },
				    {
						"step": 1,
						"inputs": [
						    {
								"name": "_process_selector_",
								"value": "proc1"
						    }
						],
						"loop": 0
				    },
				    {
						"step": 2,
						"inputs": [
						    {
								"name": "_process_selector_",
								"value": "proc2"
						    }
						],
						"loop": 1
				    },
				    {
						"step": 3,
						"inputs": [
						    {
								"name": "_process_selector_",
								"value": "main"
						    }
						],
						"loop": 1
				    },
				    {
						"step": 4,
						"inputs": [
						    {
								"name": "_process_selector_",
								"value": "proc1"
						    }
						],
						"loop": 1
				    },
				    {
						"step": 5,
						"inputs": [
						    {
								"name": "_process_selector_",
								"value": "proc2"
						    }
						],
						"loop": 1
				    },
				    {
						"step": 6,
						"inputs": [
						    {
								"name": "_process_selector_",
								"value": "main"
						    }
						],
						"loop": 0
				    }
				]
		    }
		}
    ]

generation = "MODULE main\nVAR\nproc1WantsToEnter : boolean;\nproc2WantsToEnter : boolean;\nproc1 : process proc(proc1WantsToEnter,proc2WantsToEnter);\nproc2 : process proc(proc2WantsToEnter,proc1WantsToEnter);\n\n\nASSIGN\ninit(proc1WantsToEnter) := FALSE;\ninit(proc2WantsToEnter) := FALSE;\n\nLTLSPEC \n        G ! (proc1.state = critical & proc2.state = critical);\nLTLSPEC \n        NAME NoDed := ! F G((proc1.state = entering2) & (proc2.state = entering2));\nMODULE proc(First, Second)\nVAR\nstate : {normal,critical,entering1,entering2,leaving};\n\n\nASSIGN\ninit(state) := entering1;\n\nnext(First) := case\n\t First = FALSE & state=entering1 : { TRUE };\n\t First = TRUE & state=leaving : { FALSE };\n\t TRUE : First;\nesac;\nnext(state) := case\n\t state = entering1 : { entering2 };\n\t state = entering2 & (Second) : { entering2 };\n\t state = entering2 & (!Second) : { critical };\n\t state = critical : { critical, leaving };\n\t state = leaving : { normal };\n\t state = normal : { normal, entering1 };\n\t TRUE : state;\nesac;\n"

parse_file = [
    {
        "name": "main",
        "open": True,
        "content": [
            {
                "name": "proc1WantsToEnter",
                "globalname": "proc1WantsToEnter",
                "graph": {
                    "nodes": [
                        {
                            "id": "TRUE",
                            "label": "TRUE"
                        },
                        {
                            "id": "FALSE",
                            "label": "FALSE"
                        }
                    ],
                    "edges": []
                }
            },
            {
                "name": "proc2WantsToEnter",
                "globalname": "proc2WantsToEnter",
                "graph": {
                    "nodes": [
                        {
                            "id": "TRUE",
                            "label": "TRUE"
                        },
                        {
                            "id": "FALSE",
                            "label": "FALSE"
                        }
                    ],
                    "edges": []
                }
            },
            {
                "name": "proc1",
                "globalname": "proc1",
                "graph": {
                    "nodes": [],
                    "edges": []
                }
            },
            {
                "name": "proc2",
                "globalname": "proc2",
                "graph": {
                    "nodes": [],
                    "edges": []
                }
            }
        ],
        "input": "",
        "var": [
            {
                "name": "proc1WantsToEnter",
                "type": "boolean",
                "value": "",
                "assign": [
                    "init(proc1WantsToEnter) := FALSE"
                ]
            },
            {
                "name": "proc2WantsToEnter",
                "type": "boolean",
                "value": "",
                "assign": [
                    "init(proc2WantsToEnter) := FALSE"
                ]
            },
            {
                "name": "proc1",
                "type": "process",
                "value": "proc(proc1WantsToEnter,proc2WantsToEnter)",
                "assign": []
            },
            {
                "name": "proc2",
                "type": "process",
                "value": "proc(proc2WantsToEnter,proc1WantsToEnter)",
                "assign": []
            }
        ],
        "define": [],
        "constants": [],
        "spec": [
            {
                "type": "LTLSPEC",
                "content": "       G ! (proc1.state = critical & proc2.state = critical)"
            },
            {
                "type": "LTLSPEC",
                "content": "       NAME NoDed := ! F G((proc1.state = entering2) & (proc2.state = entering2))"
            }
        ]
    },
    {
        "name": "proc",
        "open": False,
        "content": [
            {
                "name": "First",
                "globalname": "proc1WantsToEnter",
                "graph": {
                    "nodes": [
                        {
                            "id": "TRUE",
                            "label": "TRUE"
                        },
                        {
                            "id": "FALSE",
                            "label": "FALSE"
                        }
                    ],
                    "edges": [
                        {
                            "from": "FALSE",
                            "to": "TRUE",
                            "label": "state=entering1"
                        },
                        {
                            "from": "TRUE",
                            "to": "FALSE",
                            "label": "state=leaving"
                        }
                    ]
                }
            },
            {
                "name": "Second",
                "globalname": "proc2WantsToEnter",
                "graph": {
                    "nodes": [
                        {
                            "id": "TRUE",
                            "label": "TRUE"
                        },
                        {
                            "id": "FALSE",
                            "label": "FALSE"
                        }
                    ],
                    "edges": []
                }
            },
            {
                "name": "state",
                "globalname": "state",
                "graph": {
                    "nodes": [
                        {
                            "id": "normal",
                            "label": "normal"
                        },
                        {
                            "id": "critical",
                            "label": "critical"
                        },
                        {
                            "id": "entering1",
                            "label": "entering1"
                        },
                        {
                            "id": "entering2",
                            "label": "entering2"
                        },
                        {
                            "id": "leaving",
                            "label": "leaving"
                        }
                    ],
                    "edges": [
                        {
                            "from": "entering1",
                            "to": "entering2",
                            "label": ""
                        },
                        {
                            "from": "entering2",
                            "to": "entering2",
                            "label": "(Second)"
                        },
                        {
                            "from": "entering2",
                            "to": "critical",
                            "label": "(!Second)"
                        },
                        {
                            "from": "critical",
                            "to": "critical",
                            "label": ""
                        },
                        {
                            "from": "critical",
                            "to": "leaving",
                            "label": ""
                        },
                        {
                            "from": "leaving",
                            "to": "normal",
                            "label": ""
                        },
                        {
                            "from": "normal",
                            "to": "normal",
                            "label": ""
                        },
                        {
                            "from": "normal",
                            "to": "entering1",
                            "label": ""
                        }
                    ]
                }
            }
        ],
        "input": "(First, Second)",
        "var": [
            {
                "name": "state",
                "type": "state",
                "value": "{normal,critical,entering1,entering2,leaving}",
                "assign": [
                    "init(state) := entering1"
                ]
            }
        ],
        "define": [],
        "constants": []
    }
]


class ProjectsTestCase(TestCase):

	def setUp(self) -> None:
		self.user = User.objects.create(username='testuser',password='1234')
		self.project = Projects.objects.create(title="test_title",author=self.user,input_file=input_file,output_file="")
		self.project = Projects.objects.create(title="test_title1",author=self.user,input_file="input",output_file="")

	def test_response_get_projects(self):
		factory = RequestFactory()
		request = factory.get('')
		request.user = self.user
		response = ProjectsViewSet.as_view({"get": "get"})(request, user="testuser")
		
		self.assertEqual(response.status_code,200)
		self.assertEqual(response.data[0]["title"],"test_title")
		self.assertEqual(response.data[0]["id"],self.user.id)
		self.assertEqual(len(response.data),2)

	
	def test_response_get_project(self):

		factory = APIRequestFactory()
		data = {"title":"test3","author":self.user.id,"input_file":"test","output_file":""}
		
		request = factory.post('',data)
		request.user = self.user
		response = getProjectViewSet.as_view({"post": "post"})(request, user="testuser",project="test3")
		
		self.assertEqual(response.status_code,200)

		request = factory.get('')
		response = getProjectViewSet.as_view({"get": "get"})(request, user="testuser",project="test3")

		self.assertEqual(response.status_code,200)
		self.assertEqual(len(response.data),1)
		self.assertEqual(response.data[0]["title"],"test3")
		self.assertEqual(response.data[0]["author"],self.user.id)
		self.assertEqual(response.data[0]["input_file"],"test")
		self.assertEqual(response.data[0]["output_file"],"")


	def test_response_launch(self):
		factory = APIRequestFactory()
		data = {"user":"testuser","project":"test_title"}
		request = factory.post('',data)
		request.user = self.user
		response = launch(request)
		
		self.assertEqual(response.status_code,200)
		self.assertEqual(response.data["text"], output_file)
		self.assertEqual(response.data["structure"], visualization_file)

		data = {"user":"testuser11","project":"test_title"}
		request = factory.post('',data)
		request.user = self.user
		response = launch(request)

		self.assertEqual(response.data,"No such user")
		self.assertEqual(response.status_code,404)

	def test_response_parse(self):
		factory = APIRequestFactory()
		data = {"user":"testuser","project":"test_title"}       
		request = factory.post('',data)
		request.user = self.user
		response = parse_smv_file(request)

		self.assertEqual(response.status_code,200)
		self.assertEqual(response.data,parse_file)

		data = {"user":"testuser11","project":"test_title"}     
		request = factory.post('',data)
		request.user = self.user
		response = parse_smv_file(request)

		self.assertEqual(response.data,[])

		data = {"project":"test_title"}     
		request = factory.post('',data)
		request.user = self.user
		response = parse_smv_file(request)

		self.assertEqual(response.status_code,404)
		
	def test_response_generation(self):
		factory = APIRequestFactory()
		data = {"moduls":parse_file}
		request = factory.post('',data, format="json")
		request.user = self.user
		response = create_smv_file(request, username="testuser",projectname="test_title")

		self.assertEqual(response.status_code,200)
		self.assertEqual(response.data,generation)

		data = {"moduls":parse_file}
		request = factory.post('',data, format="json")
		request.user = self.user
		response = create_smv_file(request, username="not_found_user",projectname="test_title")
		self.assertEqual(response.status_code,404)

		data = {"moduls":parse_file}
		request = factory.post('',data, format="json")
		request.user = self.user
		response = create_smv_file(request, username="testuser",projectname="not_found_title")
		self.assertEqual(response.status_code,404)


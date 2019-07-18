process.env.AUTH_TYPE = 'basic';
const request = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });
const username = process.env.username;
const password = process.env.password;

let tokenUser = null; 
let tokenAdmin = null;
let flowID = null;
let flowName = null;
let flowStatus = null;
let token = null;
let status_flow = null;
let domainID = null;
let componentID = null;


describe('User Routes', () => {
    jest.setTimeout(15000);

	//testing "login" in folder "iam"
	
	//--------------------------------------------------------------------------------------
		
    test('--- FLOW REPO 2. GET All FLOWS ---', async (done) => { 
        const getAllFlows = {
        	method: 'GET',
            	uri: `http://flow-repository.openintegrationhub.com/flows`,
            	headers: {
                	"Authorization" : " Bearer " + tokenAdmin, 
            	}
        };
	const response = await request(getAllFlows);
     	expect(response.statusCode).toEqual(200);
     done();
     });

    test('--- FLOW REPO 3. ADD NEW FLOW ---', async (done) => {
	const createdFlow = {
   					"name":"D Testflow",
   					"description":"This flow takes actions at regular invervals based on a set timer",
   					"graph":{
     						 "nodes":[
         						{
            						"id":"step_1",
            						"componentId":"5cb87489df763a001a54c7de",
            						"function":"timer",
            						"name":"step_1",
            						"description":"string",
            						"fields":{
               							"intervall":"minute"
            						}
        				 		},
         						{
            						"id":"step_2",
            						"componentId":"5cdaba4d6474a5001a8b2588",
            						"function":"execute",
            						"fields":{
               							"code":"function* run() {console.log('Calling external URL');yield request.post({uri: 'http://requestbin.fullcontact.com/12os6ec1', body: msg, json: true});}"
            						}
         						}
      							],
      						"edges":[
         					{
            					"source":"step_1",
            					"target":"step_2"
         					}
      						]
   					},
   					"type":"ordinary",
   					"cron":"*/2 * * * *",
   					"owners":[]
   		};
        	const addFlow = {
        	method: 'POST',
        	uri: `http://flow-repository.openintegrationhub.com/flows`,
        	json: true,
			headers: {
                	"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: createdFlow		
		};
		const response = await request(addFlow);
	    	    
		const getFlowId = async res => {
			try {
				id = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return id; 
		};
		flowID = await getFlowId(response);

		const getFlowName = async res2 => {
			try {
				name = await Promise.resolve(res2.body.data.name);
			}
			catch (error) {
				console.log(error);
			}
			return name; 
		};
		const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
		};

		flowName = await getFlowName(response);
		flowStatus = await getFlowStatus(response); 
		
		console.log("token: " + tokenAdmin);
		//console.log("name: " + flowName);
		//console.log("id: " + flowID);

		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	test('--- FLOW REPO 4. GET FLOW BY ID ---', async (done) => { 
		const getFlowById = {
				method: 'GET',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
			};
		const response = await request(getFlowById);
		expect(response.statusCode).toEqual(200);
		done();
	});
	// patch here

	test('--- FLOW REPO 5. START FLOW BY ID ---', async (done) => { 
		const startFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/start`,
					//json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response = await request(startFlowById);	
		expect(response.statusCode).toEqual(200); 
	done();   		
	});

	test('--- FLOW REPO 6. STOP FLOW BY ID ---', async (done) => { 
		var status = false;
		while (status != true) {	
			const checkStatus = {
        			method: 'GET',
        			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        			json: true,
				headers: {
                			"Authorization" : " Bearer " + tokenAdmin 
            			}		
			};
			const response = await request(checkStatus);
			const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
			};
			flowStatus = await getFlowStatus(response);
			if (flowStatus == "active") {
				status = true;
			}
		};
			
		const stopFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/stop`,
					json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response2 = await request(stopFlowById);	
		expect(response2.statusCode).toEqual(200); 
    	done();
	});

	test('--- FLOW REPO 7. PATCH FLOW BY ID ---', async (done) => { 
		var status2 = false;
		while (status2 != true) {	
			const checkStatus = {
        			method: 'GET',
        			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        			json: true,
				headers: {
                			"Authorization" : " Bearer " + tokenAdmin 
            			}		
			};
			const response = await request(checkStatus);
			const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
			};
			flowStatus = await getFlowStatus(response);
			if (flowStatus == "inactive") {
				status2 = true;
			}
		};
		const getFlowData = {
			method: 'GET',
			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		var response = await request(getFlowData);

		const newName = "new given name " + flowName;

		response.body.data.name = newName;

		const patchFlow = {
        		method: 'PATCH',
        		uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: response 		
		};
		
		expect(response.statusCode).toEqual(200);
		done();
	});
	
	test('--- FLOW REPO 8. DELETE FLOW BY ID ---', async (done) => { 
		var status3 = false;
		while (status3 != true) {	
			const checkStatus = {
        			method: 'GET',
        			uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
        			json: true,
				headers: {
                			"Authorization" : " Bearer " + tokenAdmin 
            			}		
			};
			const response = await request(checkStatus);
			const getFlowStatus = async res3 => {
			try {
				status = await Promise.resolve(res3.body.data.status);
			}
			catch (error) {
				console.log(error);
			}
			return status; 
			};
			flowStatus = await getFlowStatus(response);
			if (flowStatus == "inactive") {
				status3 = true;
			}
		};
		const deleteFlowById = {
				method: 'DELETE',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
					json:	true,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
		};
		const response = await request(deleteFlowById);
		expect(response.statusCode).toEqual(200);
	done();
	});

	//--------------------------------------------------------------------------------------
	
	test('--- AUDIT LOG 9. GET ALL LOGS ---', async (done) => {
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
					"Authorization" : " Bearer " + tokenAdmin 
				}
		};
		const response = await request(getAllLogs);
		//console.log("get all logs: " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
	done();
	});

	test('--- AUDIT LOG 10. ADD LOG ---', async (done) => { 
		process.env.IAM_AUTH_TYPE = 'basic';
		const createdLog = {
        		"service": "MyService",
  			"timeStamp": "1234567",
  			"nameSpace": "outerSpace",
  			"payload": {
    				"tenant": "1",
    				"source": "SomeSource",
    				"object": "SomeObject",
    				"action": "foo",
    				"subject": "Test Subject",
    				"details": "A human-readable detailed description"
  			}
		};    
        	const addLog = {
        		method: 'POST',
        		uri: `http://auditlog.openintegrationhub.com/logs`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin 
            		},
        		body: createdLog		
		};
		const response = await request(addLog);
		//console.log("added logs" + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	
	
	//-----------------------------------neg-audit-----------------------------------------------------
	var invalidToken = tokenAdmin + "axsyfdas"
	
	test('--- AUDIT LOG 11. MISSING AUTH ---', async (done) => {
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
				//	"Authorization" : " Bearer " + invalidAdmin 
				}
		};
		const response = await request(getAllLogs);
		//console.log("get all logs: " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	
	test('--- AUDIT LOG 12. INVALID TOKEN ---', async (done) => {
		const getAllLogs = {
			method: 'GET',
				uri: `http://auditlog.openintegrationhub.com/logs`,
				json:	true,
				headers: {
					"Authorization" : " Bearer " + invalidToken
				}
		};
		const response = await request(getAllLogs);
		//console.log("get all logs: " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	
	
	//---------------------------------------neg-flow----------------------------------------------------
	
	test('--- FLOW REPO 13. GET All FLOWS - INVALID TOKEN ---', async (done) => { 
        const getAllFlows = {
        	method: 'GET',
            	uri: `http://flow-repository.openintegrationhub.com/flows`,
            	headers: {
                	"Authorization" : " Bearer " + invalidToken, 
            	}
        };
	const response = await request(getAllFlows);
     	expect(response.statusCode).toEqual(401);
     	done();
     	});

    	test('--- FLOW REPO 14. ADD NEW FLOW - INVALID TOKEN ---', async (done) => {
		const createdFlow = {
   					"name":"D Testflow",
   					"description":"This flow takes actions at regular invervals based on a set timer.",
   					"graph":{
     						 "nodes":[
         						{
            						"id":"step_1",
            						"componentId":"5cb87489df763a001a54c7de",
            						"function":"timer",
            						"name":"step_1",
            						"description":"string",
            						"fields":{
               							"intervall":"minute"
            						}
        				 		},
         						{
            						"id":"step_2",
            						"componentId":"5cdaba4d6474a5001a8b2588",
            						"function":"execute",
            						"fields":{
               							"code":"function* run() {console.log('Calling external URL');yield request.post({uri: 'http://requestbin.fullcontact.com/12os6ec1', body: msg, json: true});}"
            						}
         						}
      							],
      						"edges":[
         					{
            					"source":"step_1",
            					"target":"step_2"
         					}
      						]
   					},
   					"type":"ordinary",
   					"cron":"*/2 * * * *",
   					"owners":[]
   		};
        	const addFlow = {
        		method: 'POST',
        		uri: `http://flow-repository.openintegrationhub.com/flows`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		},
        		body: createdFlow		
		};
		const response = await request(addFlow);		
		expect(response.statusCode).toEqual(401);
    	done();
	});
	
	test('--- FLOW REPO 15. GET FLOW BY ID - INVALID TOKEN ---', async (done) => { 
		const getFlowById = {
				method: 'GET',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}`,
					headers: {
						"Authorization" : " Bearer " + invalidToken, 
					}
			};
		const response = await request(getFlowById);

		expect(response.statusCode).toEqual(401);
		done();
	});
	
	test('--- FLOW REPO 16. GET FLOW BY ID - FLOW ID NOT FOUND ---', async (done) => { 
		const getFlowById = {
				method: 'GET',
					uri: `http://flow-repository.openintegrationhub.com/flows/324423`,
					headers: {
						"Authorization" : " Bearer " + tokenAdmin, 
					}
			};
		const response = await request(getFlowById);

		expect(response.statusCode).toEqual(400);
		done();
	});

	test('--- FLOW REPO 17. START FLOW BY ID - INVALID TOKEN ---', async (done) => { 
		const startFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/start`,
					//json:	true,
					headers: {
						"Authorization" : " Bearer " + invalidToken, 
					}
		};
		const response = await request(startFlowById);	 
		expect(response.statusCode).toEqual(401); 
	done();   		
	});

	test('--- FLOW REPO 18. STOP FLOW BY ID - INVALID TOKEN ---', async (done) => { 			
		const stopFlowById = {
				method: 'POST',
					uri: `http://flow-repository.openintegrationhub.com/flows/${flowID}/stop`,
					json:	true,
					headers: {
						"Authorization" : " Bearer " + invalidToken, 
					}
		};
		const response2 = await request(stopFlowById);	
		expect(response2.statusCode).toEqual(401); 
    	done();
	});

	test('--- FLOW REPO 19. PATCH FLOW BY ID - FLOW ID NOT FOUND ---', async (done) => { 
		// flow was already stopped and deleted in earlier tests, simulates "can't be found"
		var newBody = "some string";
		const tempFlowID = "29384329856";
		const patchFlow = {
        		method: 'PATCH',
        		uri: `http://flow-repository.openintegrationhub.com/flows/${tempFlowID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}		
		};
		response = await request(patchFlow);
		//console.log("neg patch " + JSON.stringify(response.body));
		expect(response.statusCode).toEqual(400); //docu:404
		done();
	});
	
	test('--- FLOW REPO 20. DELETE FLOW BY ID - FLOW ID NOT FOUND ---', async (done) => { 
		const deleteFlowById = {
			method: 'DELETE',
			uri: `http://flow-repository.openintegrationhub.com/flows/1982312`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
				}
			};
		const response = await request(deleteFlowById);
		expect(response.statusCode).toEqual(400);
	done();
	});
	
	
	
	//---------------------------------------metadata-repository---------------------------------------------------
	
	test('--- METADATA REPO 21. GET ALL DOMAINS ---', async (done) => {
		const getAllDomains = {
			method: 'GET',
			uri: `http://metadata.openintegrationhub.com/api/v1/domains`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
				}
		};
		const response = await request(getAllDomains);
		expect(response.statusCode).toEqual(200); 
	done();
	});
	
	test('--- METADATA REPO 22. CREATE NEW DOMAIN ---', async (done) => {
		const toBeUploaded = {
  					"data": {
    						"name": "string",
    						"description": "string",
    						"public": true,
    						"owners": [
      							{
        						"id": "string",
        						"type": "string"
      							}
    						],
    						"id": "string",
    						"createdAt": "2019-06-03T14:58:39.897Z",
    						"updatedAt": "2019-06-03T14:58:39.897Z"
  					}					
		};
		const getAllDomains = {
        		method: 'POST',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: toBeUploaded		
		};		
		const response = await request(getAllDomains);
		
		const getDomainID = async res => {
			try {
				var domain_ID = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return domain_ID; 
		};
		domainID = await getDomainID(response);
		console.log(JSON.stringify("domain id: " + domainID));
		expect(response.statusCode).toEqual(200);
	
	done();
	});
	
	test('--- METADATA REPO 23. GET DOMAIN BY ID ---', async (done) => {
		const getDomainByID = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}		
		};		
		const response = await request(getDomainByID);
		expect(response.statusCode).toEqual(200);
	
	done();
	});
	
	test('--- METADATA REPO 24. PUT DOMAIN BY ID ---', async (done) => { 	
		const getDomainData = {
			method: 'GET',
			uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(getDomainData);
		const domainDesc = "short desc update";
		const newDescription = "new description: " + domainDesc;
		response.body.data.description = newDescription;

		const patchDomain = {
        		method: 'PUT',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: response 		
		};
		expect(response.statusCode).toEqual(200);
	
	done();
	});
		
	test('--- METADATA 25. IMPORT DOMAIN MODEL ---', async(done) => {   
		const newModel = {
    				"data": {
        				"name": "test",
        				"description": "upload test",
        				"value": {
            					"$id": "testing",
            					"properties": {
                					"first_name": {
                    						"type": "string"
                					},
                					"last_name": {
                    						"type": "string"
                						}
            						}
        					}
    				}
		};
		
		const addDomainModel = {
        		method: 'POST',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: newModel		
		};
		
		const response = await request(addDomainModel);
		console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
		
    	done();
	});
	
	test('--- METADATA REPO 25.1 PUT DOMAIN MODEL BY URI ---', async(done) => {   
		const newModel = {
    				"data": {
        "name": "test",
        "description": "upload test",
        "value": {
            "$id": "testing",
            "properties": {
                "first_name": {
                    "type": "string"
                },
                "given_name": {
                    "type": "string"
                }
            			}
        			}
    			}
		};
		
		const addDomainModel = {
        		method: 'PUT',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/testing`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: newModel		
		};
		
		const response = await request(addDomainModel);
		console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
		
    	done();
	});
	
	test('--- METADATA REPO 26. GET ALL DOMAIN MODEL SCHEMES ---', async(done) => {   	
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(requestOptions);
		console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
    	done();
	});
	
	test('--- METADATA REPO 26.1 GET DOMAIN MODEL SCHEME BY ID ---', async(done) => {   	
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/testing`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(requestOptions);
		console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(200);
    	done();
	});
	
	test('--- METADATA REPO 26.2 DELETE DOMAIN MODEL SCHEME BY ID ---', async(done) => {   	
		const requestOptions = {
        		method: 'DELETE',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}/schemas/testing`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(requestOptions);
		console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(204);
    	done();
	});
	
	//---------------------------------------component-repository---------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------
	
	test('--- COMPONENT REPO 27. GET ALL COMPONENTS ---', async(done) => {   
		const getAllComponents = {
        		method: 'GET',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(getAllComponents);
		expect(response.statusCode).toEqual(200);
    	done();
	});
	
	test('--- COMPONENT REPO 28. CREATE NEW COMPONENT ---', async(done) => {   
		const newComponent = {
  					"data": {
    					"name": "My Component",
    					"description": "My Component",
    					"access": "public",
    					"descriptor": {},
    					"distribution": {
      						"type": "docker",
      						"image": "openintegrationhub/email",
      						"registrySecretId": "5b62c919fd98ea00112d52e7"
    					},
    					"owners": [
      						{
        					"id": "123",
        					"type": "user"
      						}
    					]
  					}
		};
		const createNewComponent = {
        		method: 'POST',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
			body: newComponent
		};
		
		const response = await request(createNewComponent);
		
		const getComponentID = async res => {
			try {
				var component_ID = await Promise.resolve(res.body.data.id);
			}
			catch (error) {
				console.log(error);
			}
			return component_ID; 
		};
		componentID = await getComponentID(response);
		expect(response.statusCode).toEqual(201);
    	done();
	});
	
	test('--- COMPONENT REPO 29. GET COMPONENT BY ID ---', async(done) => {
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(200);
		
	done();
	});	
	
	
	test('--- COMPONENT REPO 30. PATCH COMPONENT BY ID ---', async(done) => {
		const getComponentData = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		var response = await request(getComponentData);
		const newDescription = "new given desc ";

		response.body.data.description = newDescription;
			
		const patchComponent = {
        		method: 'PATCH',
        		uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
			body: response
		};
		const patchedComponent = await request(patchComponent);
		expect(response.statusCode).toEqual(200);
		done();	
	done();	
	});
	
	test('--- COMPONENT REPO 31. DELETE COMPONENT BY ID ---', async (done) => { 
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
				}
			};
		const response = await request(deleteComponentById);
		expect(response.statusCode).toEqual(204);
	done();
	});
	
	//---------------------------------------------------------------------------------------------------------
	
	test('--- COMPONENT REPO 32. GET ALL COMPONENTS - TOKEN INVALID ---', async(done) => {   
		const getAllComponents = {
        		method: 'GET',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		const response = await request(getAllComponents);
		expect(response.statusCode).toEqual(401);
    	done();
	});
	
	test('--- COMPONENT REPO 33. CREATE NEW COMPONENT - TOKEN INVALID ---', async(done) => {   
		const newComponent = {
  					"data": {
    					"name": "My Component",
    					"description": "My Component",
    					"access": "public",
    					"descriptor": {},
    					"distribution": {
      						"type": "docker",
      						"image": "openintegrationhub/email",
      						"registrySecretId": "5b62c919fd98ea00112d52e7"
    					},
    					"owners": [
      						{
        					"id": "123",
        					"type": "user"
      						}
    					]
  					}
		};
		const createNewComponent = {
        		method: 'POST',
        		uri: `http://component-repository.openintegrationhub.com/components/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		},
			body: newComponent
		};
		
		const response = await request(createNewComponent);
		//console.log("component id: " + componentID);
		expect(response.statusCode).toEqual(401);
    	done();
	});
	
	test('--- COMPONENT REPO 34. GET COMPONENT BY ID - TOKEN INVALID ---', async(done) => {
		
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(401);		
	done();
	});
	
	test('--- COMPONENT REPO 35. GET COMPONENT BY ID - COMPONENT NOT FOUND / ID NOT FOUND ---', async(done) => {	
		var invalidComponentID = "5d09fe4a5b915f001bb4234a";
		
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${invalidComponentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(404);
	done();
	});
	
	test('--- COMPONENT REPO 36. GET COMPONENT BY ID - ID INVALID ---', async(done) => {	
		var invalidComponentID = "&$$%&%$§";
		
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${invalidComponentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		
		const response = await request(getComponentById);	
		expect(response.statusCode).toEqual(400);
	done();
	});
	
	test('--- COMPONENT REPO 37. PATCH COMPONENT BY ID - COMPONENT NOT FOUND ---', async(done) => {	
		const getComponentById = {
			method: 'GET',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		const response = await request(getComponentById);	
		//console.log(JSON.stringify(response.body));
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	test('--- COMPONENT REPO 38. DELETE COMPONENT BY ID - TOKEN INVALED ---', async (done) => { 
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + invalidToken, 
			}
		};
		const response = await request(deleteComponentById);
		expect(response.statusCode).toEqual(401);
	done();
	});
	
	test('--- COMPONENT REPO 39. DELETE COMPONENT BY ID - COMPONENT NOT FOUND / ID INVALID ---', async (done) => { 
		var invalidComponentID = "5d09fe4a5b915f001bb4234a";
		const deleteComponentById = {
			method: 'DELETE',
			uri: `http://component-repository.openintegrationhub.com/components/${componentID}`,
			json:	true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(deleteComponentById);
		expect(response.statusCode).toEqual(404);
	done();
	});
	
	//---------------------------------------metadata-repository---------------------------------------------------
	//--------------------------------------------------------------------------------------------------------------
	
	test('--- METADATA REPO 40. GET ALL DOMAIN MODELS - INVALID TOKEN ---', async(done) => {   	
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/domains/${domainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		}
		};
		
		const response = await request(requestOptions);
		expect(response.statusCode).toEqual(404);
		console.log(JSON.stringify(response.body));
    	done();
	});
	
	test('--- METADATA REPO 41. GET ALL DOMAIN MODELS - INVALID DOMAIN ID ---', async(done) => {  
		var invalidDomainID = "034957430985";
		const requestOptions = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/domains/${invalidDomainID}/schemas`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}
		};
		
		const response = await request(requestOptions);
		expect(response.statusCode).toEqual(404);
		console.log(JSON.stringify(response.body));
    	done();
	});
	
	test('--- METADATA REPO 42. CREATE NEW DOMAIN - INVALID TOKEN ---', async (done) => {
		const toBeUploaded = {
  					"data": {
    						"name": "string",
    						"description": "string",
    						"public": true,
    						"owners": [
      							{
        						"id": "string",
        						"type": "string"
      							}
    						],
    						"id": "string",
    						"createdAt": "2019-06-03T14:58:39.897Z",
    						"updatedAt": "2019-06-03T14:58:39.897Z"
  					}					
		};
		const getAllDomains = {
        		method: 'POST',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + invalidToken, 
            		},
        		body: toBeUploaded		
		};		
		const response = await request(getAllDomains);
		expect(response.statusCode).toEqual(401);
	
	done();
	});
	
	test('--- METADATA REPO 43. GET DOMAIN BY ID - INVALID DOMAIN ID ---', async (done) => {
		var invalidDomainID ="lksfhdslfh";
		const getDomainByID = {
        		method: 'GET',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${invalidDomainID}`,
        		json: true,
			headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		}		
		};		
		const response = await request(getDomainByID);
		expect(response.statusCode).toEqual(404);
	done();
	});
	
	test('--- METADATA REPO 44. PUT DOMAIN BY ID - INVALID DOMAIN ID ---', async (done) => { 	
		var invalidDomainID ="lksfhdslfh";
		const getDomainData = {
			method: 'GET',
			uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domainID}`,
			json: true,
			headers: {
				"Authorization" : " Bearer " + tokenAdmin, 
			}
		};
		const response = await request(getDomainData);
		const domainDesc = "short descr update";
		const newDescription = "new description: " + domainDesc;
		response.body.data.description = newDescription;

		const patchDomain = {
        		method: 'PUT',
        		uri: `http://metadata.openintegrationhub.com/api/v1/domains/${invalidDomainID}`,
        		json: true,
				headers: {
                		"Authorization" : " Bearer " + tokenAdmin, 
            		},
        		body: response 		
		};
		const response2 = await request(patchDomain);
		expect(response2.statusCode).toEqual(404);
	done();
	});
});

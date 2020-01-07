import * as k8s from "@pulumi/kubernetes";
import * as kx from "@pulumi/kubernetesx";
import * as pulumi from "@pulumi/pulumi";
import * as helm from "@pulumi/kubernetes/helm";
import * as valueslist from './values';  
const __ = new pulumi.Config();


let endPointArray = [];
var deployed_service_name:string;
let list_deployed_services = require('../outputs/services.json');
var values= {};

// Expose a K8s provider instance using our custom cluster instance.
const k8sProvider = new k8s.Provider("myprovider", {
    // kubeconfig: k8sCluster.kubeConfigRaw,
    kubeconfig: __.require('kubeConfig')
});

for (let index = 0; index < list_deployed_services.length; index++) {

//For the endPoints and the values
if(list_deployed_services[index].chart_name=='jenkins'){
    deployed_service_name="jenkins";
    values = valueslist.jenkinsValues;
}
else if(list_deployed_services[index].chart_name=='sonarqube'){
    deployed_service_name='sonarqube-sonarqube';
    values=valueslist.sonarQube;
}
else if(list_deployed_services[index].chart_name=='sonatype-nexus') {
    deployed_service_name='nexus-sonatype-nexus';
    values=valueslist.nexusValues;
}
else{
    deployed_service_name="";
}
    //Values
    const service  = new helm.v2.Chart(list_deployed_services[index].release_name,{
        repo:list_deployed_services[index].repo,
        chart:list_deployed_services[index].chart_name,
        values:values
        // version:"3.2.7"
    },
    {providers:{ kubernetes: k8sProvider}});
    endPointArray.push({service_name :list_deployed_services[index].chart_name , endPoint: service.getResource("v1/Service",deployed_service_name).status.loadBalancer.ingress[0].ip});
    //endPointValue = service.getResource("v1/Service",deployed_service_name).status.loadBalancer.ingress[0].ip;
        
}



 export let endPoint = endPointArray;
// export let jenkinsEndPoint = service.getResource("v1/Service","jenkins").status.loadBalancer.ingress[0].ip;
// export let nexusEndPoint = service.getResource("v1/Service","sonatype-nexus").status.loadBalancer.ingress[0].ip;

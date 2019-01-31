/**
 * IDChain Cloud Agent REST API
 * API Tests
 * Tests /user with wallet
 */
'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const vars = require('./0-test-vars');

const {describe, it} = mocha;
const agent = vars.agent;
const request = require('supertest');
const agentAbs = request.agent('');
const bothHeaders = vars.bothHeaders;
const firstToken = process.env.firstToken || process.argv[2];
const secondToken = process.env.secondToken || process.argv[3];
const firstDidObj = {
    endpoint_did: "71G8fKkU4RDZ3TYryakLN7",
    verkey: "4GpDPMW3y9UUcDe9DABbY8npgEgSHwnscyQ2GPbLnYCq",
    endpoint: firstToken
};
const updatedDidObj = {
    endpoint_did: "71G8fKkU4RDZ3TYryakLN7",
    verkey: "4GpDPMW3y9UUcDe9DABbY8npgEgSHwnscyQ2GPbLnYCq",
    endpoint: secondToken
};
const message = "message to registered token";
const newMessage = "message to new token";
const longMessage = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam consequat, odio non laoreet " +
    "semper, odio dolor tincidunt enim, sed elementum velit justo at felis. In ornare non augue id faucibus. " +
    "Nullam porta leo ac condimentum feugiat. Phasellus ac feugiat mauris. Vivamus egestas id magna vel facilisis. In " +
    "volutpat eu sem sit amet sagittis. Pellentesque vitae orci porttitor, scelerisque ligula sed, molestie neque. Morbi " +
    "vitae nisl vitae tellus tincidunt posuere id venenatis augue. Quisque eu ex gravida tellus aliquet tempus. Ut non " +
    "faucibus felis.Vivamus lacinia sed velit eu tristique. Curabitur dapibus at tortor non pretium. Phasellus pretium quam " +
    "et commodo facilisis. Phasellus non consequat odio. Vestibulum laoreet lectus id lectus placerat euismod. Duis pulvinar " +
    "sem porttitor malesuada tristique. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean in odio sit amet " +
    "lorem vehicula tempor. Pellentesque malesuada mi ut sem aliquam consequat.Sed pellentesque rutrum dui, in tincidunt " +
    "lectus egestas at. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique " +
    "senectus et netus et malesuada fames ac turpis egestas. Curabitur quam eros, eleifend a varius viverra, ultricies " +
    "quis est. Donec at augue sit amet erat facilisis viverra. Aliquam mattis magna eget neque dictum, et sollicitudin " +
    "enim ultricies. Vivamus ut pellentesque tortor. Duis vitae scelerisque ipsum, a euismod mi. Nunc tincidunt nulla sem, " +
    "in interdum justo lacinia nec. Donec a purus at mi ultricies condimentum eu id magna. Aliquam sed dapibus ex. Morbi " +
    "vel tortor in purus auctor suscipit sed sit amet dui. Fusce at risus massa. Pellentesque tincidunt euismod turpis nec " +
    "volutpat. Maecenas vel posuere est, nec pharetra erat. Ut aliquet ligula diam, at aliquam nulla eleifend at. In et " +
    "ante at velit efficitur rhoncus. Suspendisse at nulla ut leo condimentum molestie non ac sapien. Proin viverra augue " +
    "a rutrum dignissim. Fusce in arcu diam. Proin semper erat vel libero dictum, vel interdum dui molestie. Pellentesque " +
    "sollicitudin maximus elit, in eleifend nibh auctor vitae. Nulla rhoncus lacinia suscipit. In elementum lacus elementum, " +
    "consectetur risus a, fermentum felis. Sed eget gravida augue. Curabitur cursus vel urna quis lobortis. Fusce ac molestie felis, " +
    "vitae eleifend augue. Suspendisse congue dui ex, pellentesque feugiat augue mattis sed. Sed risus leo, fringilla placerat neque " +
    "nec, suscipit suscipit orci. Vivamus vulputate porttitor neque, ac tincidunt lorem malesuada nec. Donec tristique metus a magna " +
    "lobortis, sit amet pellentesque diam consectetur. Praesent ut vehicula elit. Cras scelerisque quis diam id vulputate. Fusce sit " +
    "amet libero non dui ultricies tincidunt ac ac quam. Maecenas a sapien ac lacus laoreet efficitur. Integer fringilla, ex convallis " +
    "interdum blandit, orci elit pellentesque lacus, ac finibus felis arcu sed ex. Donec eget ipsum lorem. Aenean maximus, " +
    "dui nec congue scelerisque, risus nunc ullamcorper tortor, accumsan cursus nisi metus id dolor. Sed efficitur consectetur " +
    "psum id pellentesque. Fusce auctor non nunc ultrices tristique. Donec facilisis tincidunt ante, id iaculis enim iaculis vitae. " +
    "Maecenas eleifend magna sed enim auctor dictum. In id nisl ut tellus mollis convallis. Sed ornare posuere turpis, interdum semper " +
    "velit consectetur ac. Quisque interdum nibh in metus viverra, id congue tellus vulputate. Nam commodo nisi vel lorem porttitor," +
    " ac cursus orci feugiat. Vestibulum ac convallis erat. Fusce magna turpis, posuere nec dapibus id, gravida quis est. Sed id nulla " +
    "in dolor tempor pellentesque. Donec cursus ante quis nisi blandit vulputate. Sed dui dui, faucibus in condimentum a, " +
    "auctor fermentum libero. Praesent tristique, neque a consectetur cursus, lorem urna imperdiet orci, eu vehicula neque " +
    "velit in tortor. Morbi laoreet quis ex a hendrerit. Donec sit amet libero sed turpis blandit vulputate et non tortor. " +
    "roin arcu diam, tincidunt eu elementum sed, hendrerit faucibus orci. Ut et semper libero. Vestibulum sed posuere nulla. " +
    "Mauris at feugiat nisl. Etiam congue consequat sapien, malesuada pretium dolor commodo quis. Nunc dolor libero, euismod " +
    "in justo eu, pharetra blandit ante. Quisque vestibulum ex ut purus vehicula egestas. Praesent quis massa hendrerit ipsum " +
    "varius tincidunt ac lobortis nunc. Sed rhoncus justo a neque malesuada, a luctus ligula sagittis. Donec tempor nulla erat, " +
    "eget ullamcorper ante euismod sit amet. Aenean porta mi est, eu fermentum nulla aliquet nec. Suspendisse venenatis metus et " +
    "libero dictum, lobortis ullamcorper orci blandit. In commodo est nulla, vitae bibendum tellus bibendum id. Suspendisse " +
    "vehicula in risus finibus pharetra. Donec eu eleifend tortor. Pellentesque sodales, enim a vehicula posuere, orci ipsum " +
    "rhoncus arcu, vel accumsan tellus ipsum nec metus. Vivamus a turpis risus. In quis placerat mauris. Lorem ipsum dolor sit " +
    "amet, consectetur adipiscing elit. Sed consequat blandit dolor sed blandit. Aenean tempor elit eu egestas metus.";

let register = {};
let update = {};
let sendMessage = {};
let endpoint;


describe('CA Service Registration and Connection', function () {
    it('POST /services with initial request', async function () {
        register = await agent
            .post('/ca/api/services')
            .set(bothHeaders)
            .send(firstDidObj)
            .expect(201);

        endpoint = register.body.endpoint;
    });

    it('POST /indy/:id message to inbox', async function () {
        sendMessage = await agentAbs
            .post(endpoint)
            .set(bothHeaders)
            .send({message: Buffer.from(JSON.stringify(message).toString('base64'))})
            .expect(202);
    });

    it('POST /services update request with new endpoint/token', async function () {
        update = await agent
            .post('/ca/api/services')
            .set(bothHeaders)
            .send(updatedDidObj)
            .expect(201);
        endpoint = update.body.endpoint;
        expect(update.body).to.deep.equal(register.body);
    });

    it('POST /indy/:id message to inbox with new endpoint/token', async function () {
        sendMessage = await agentAbs
            .post(endpoint)
            .set(bothHeaders)
            .send({message: Buffer.from(JSON.stringify(newMessage).toString('base64'))})
            .expect(202);
    });

    it('POST /indy/:id large message to inbox with new endpoint/token', async function () {
        sendMessage = await agentAbs
            .post(endpoint)
            .set(bothHeaders)
            .send({message: Buffer.from(JSON.stringify(longMessage).toString('base64'))})
            .expect(202);
    });
});

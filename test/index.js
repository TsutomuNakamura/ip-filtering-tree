var chai    = require('chai'),
    should  = chai.should();
const IPFilteringTree = require('../index').IPFilteringTree;

describe('IPFilteringTree', () => {
    var dict = undefined;

    const I_IPV4_DATA                       = 0;
    const I_IPV4_LENGTH_OF_SUBNETMASK       = 1;
    const I_IPV4_LENGTH_OF_CHILD_SUBNETMASK = 2;
    const I_IPV4_REF_CHILD_NODE             = 3;

    function assertTheNode(node, data, subnetLength, subnetLengthOfChild, indexesOfChildNodes) {
        should.equal(node[I_IPV4_DATA], data);
        should.equal(node[I_IPV4_LENGTH_OF_SUBNETMASK], subnetLength);
        should.equal(node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], subnetLengthOfChild);

        should.equal(Object.keys(node[I_IPV4_REF_CHILD_NODE]).length, indexesOfChildNodes.length);
        for(var i = 0; i < indexesOfChildNodes.length; ++i) {
            should.exist(node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary(indexesOfChildNodes[i])]);
        }
    }

    beforeEach(function() {
        dict = new IPFilteringTree();
    });

    describe('#iPv4StringToBinary', () => {

        it('should convert "0.0.0.0" to 0', () => {
            dict.iPv4StringToBinary('0.0.0.0').should.equal(0);
        });
        it('should convert "255.255.255.255", to -1', () => {
            // 255.255.255.255 -> 11111111 11111111 11111111 11111111 -> -1
            dict.iPv4StringToBinary('255.255.255.255').should.equal(-1);
        });
        it('should convert "255.255.255.0" to -256', () => {
            // 255.255.255.0 -> 11111111 11111111 11111111 00000000 -> -256
            dict.iPv4StringToBinary('255.255.255.0').should.equal(-256);
        });
        it('should convert "255.255.0.0" to -65536', () => {
            // 255.255.0.0 -> 11111111 11111111 00000000 00000000 -> -65536
            dict.iPv4StringToBinary('255.255.0.0').should.equal(-65536);
        });
        it('should convert "255.0.0.0" to -16777216', () => {
            // 255.0.0.0 -> 11111111 00000000 00000000 00000000 -> -16777216
            dict.iPv4StringToBinary('255.0.0.0').should.equal(-16777216);
        });
        it('should convert "192.168.1.0" to -1062731520', () => {
            // 192.168.1.0     -> 11000000 10101000 00000001 00000000 -> -1062731520
            dict.iPv4StringToBinary('192.168.1.0').should.equal(-1062731520);
        });
        it('should convert "192.168.1.1" to -1062731519', () => {
            // 192.168.1.0     -> 11000000 10101000 00000001 00000001 -> -1062731519
            dict.iPv4StringToBinary('192.168.1.1').should.equal(-1062731519);
        });
        it('should convert "172.16.0.0" to -1408237568', () => {
            // 172.16.0.0      -> 10101100 00010000 00000000 00000000 -> -1408237568
            dict.iPv4StringToBinary('172.16.0.0').should.equal(-1408237568);
        });
        it('should convert "10.0.0.0" to 167772160', () => {
            // 10.0.0.0        -> 00001010 00000000 00000000 00000000 -> 167772160
            dict.iPv4StringToBinary('10.0.0.0').should.equal(167772160);
        });

        it('should throws exception when the invalid format of IPv4 was specified.', () => {
            (() => { dict.iPv4StringToBinary(''); }).should.throw(TypeError, 'Format of IPv4 address "" is illegal');
            (() => { dict.iPv4StringToBinary('foo'); }).should.throw(TypeError, 'Format of IPv4 address "foo" is illegal');
            (() => { dict.iPv4StringToBinary('0.0.0.0.0'); }).should.throw(TypeError, 'Format of IPv4 address "0.0.0.0.0" is illegal');
            (() => { dict.iPv4StringToBinary('0.0.0'); }).should.throw(TypeError, 'Format of IPv4 address "0.0.0" is illegal');

            (() => { dict.iPv4StringToBinary('0.0.0.'); }).should.throw(TypeError, 'Format of IPv4 address "0.0.0." is illegal');
            (() => { dict.iPv4StringToBinary('.255.255.255'); }).should.throw(TypeError, 'Format of IPv4 address ".255.255.255" is illegal');
            (() => { dict.iPv4StringToBinary('foo.255.255.255'); }).should.throw(TypeError, 'Format of IPv4 address "foo.255.255.255" is illegal');
            (() => { dict.iPv4StringToBinary('0.0.0.256'); }).should.throw(TypeError, 'Format of IPv4 address "0.0.0.256" is illegal');
            (() => { dict.iPv4StringToBinary('0.0.0.-1'); }).should.throw(TypeError, 'Format of IPv4 address "0.0.0.-1" is illegal');
        });
    });

    describe('#stringifyFromBinIPv4', () => {
        it('should stringify 0 to "0.0.0.0"', () => {
            dict.stringifyFromBinIPv4(0).should.equal('0.0.0.0');
        });
        it('should stringify 0 to "255.255.255.255"', () => {
            dict.stringifyFromBinIPv4(-1).should.equal('255.255.255.255');
        });
        it('should stringify 0 to "255.255.255.0"', () => {
            dict.stringifyFromBinIPv4(-256).should.equal('255.255.255.0');
        });
        it('should stringify 0 to "255.255.0.0"', () => {
            dict.stringifyFromBinIPv4(-65536).should.equal('255.255.0.0');
        });
        it('should stringify 0 to "255.0.0.0"', () => {
            dict.stringifyFromBinIPv4(-16777216).should.equal('255.0.0.0');
        });
        it('should stringify 0 to "192.168.1.0"', () => {
            dict.stringifyFromBinIPv4(-1062731520).should.equal('192.168.1.0');
        });
        it('should stringify 0 to "172.16.0.0"', () => {
            dict.stringifyFromBinIPv4(-1408237568).should.equal('172.16.0.0');
        });
        it('should stringify 0 to "10.0.0.0"', () => {
            dict.stringifyFromBinIPv4(167772160).should.equal('10.0.0.0');
        });
    });

    describe('#hasGlueNodeOnly', () => {
        it('should return false if no node are existed', () => {
            var node = ["dummy", 0, undefined, {}];
            dict.hasGlueNodeOnly(node).should.equal(false);
        });
        it('should return true if the node is glue', () => {
            var node = [
                           "dummy", 0, 8, {
                               0: [undefined, 8, 16, { 100: ["dummy", 16, undefined, {}] }]
                           }
                       ];
            dict.hasGlueNodeOnly(node).should.equal(true);
        });
        it('should return true if the nodes are glue', () => {
            var node = [
                           "dummy", 0, 8, {
                               0: [undefined, 8, 16, { 100: ["dummy", 16, undefined, {}] }],
                               1: [undefined, 8, 16, { 100: ["dummy", 16, undefined, {}] }]
                           }
                       ];
            dict.hasGlueNodeOnly(node).should.equal(true);
        });
        it('should return false if the node is data', () => {
            var node = [
                           "dummy", 0, 8, {
                               02: ["dymmy", 8, 16, { 100: ["dummy", 16, undefined, {}] }]
                           }
                       ];
            dict.hasGlueNodeOnly(node).should.equal(false);
        });
        it('should return false if all node are NOT glue', () => {
            var node = [
                           "dummy", 0, 8, {
                               0: [undefined, 8, 16, { 100: ["dummy", 16, undefined, {}] }],
                               1: [undefined, 8, 16, { 100: ["dummy", 16, undefined, {}] }],
                               2: ["dymmy", 8, 16, { 100: ["dummy", 16, undefined, {}] }]
                           }
                       ];
            dict.hasGlueNodeOnly(node).should.equal(false);
        });
    });

    describe('#getBinIPv4NetAddr', function() {
        it('should get the network address from the binary IPv4 address', () => {
            dict.getBinIPv4NetAddr(-1, 32).should.equal(-1);           // 255.255.255.255
            dict.getBinIPv4NetAddr(-1, 24).should.equal(-256);         // 255.255.255.0
            dict.getBinIPv4NetAddr(-1, 16).should.equal(-65536);       // 255.255.0.0
            dict.getBinIPv4NetAddr(-1, 8).should.equal(-16777216);     // 255.0.0.0
            dict.getBinIPv4NetAddr(-1, 0).should.equal(0);             // 0.0.0.0
            dict.getBinIPv4NetAddr(-1, 31).should.equal(-2);           // 255.255.255.254
        });
    });

    describe('#createNewOneNode', function() {
        it('should create a new node with specified parameters', () => {
            var result = dict.createNewOneNode({a: 0}, 16, 24, {b: 1});

            result[I_IPV4_DATA].a.should.equal(0);
            result[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(16);

            result[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK].should.equal(24);
            result[I_IPV4_REF_CHILD_NODE].b.should.equal(1);
        });
    });

    describe('#createGlueNodes', () => {
        it('should create a sinble glue node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 2) 192.168.1.0/24(d)    |
                +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | New
                +-+-----------------------+
                | 192.168.0.0/16(g)       |
                +-------------------------+
                  |
                +-+-----------------------+
                | 192.168.1.0/24(d)       |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 16);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, undefined, 16, 24, ['192.168.1.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, undefined, []);
        });
        it('should create a single glue node over the glue node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 192.168.0.0/16(g)       |
                +-------------------------+
                  |
                +-+-----------------------+
                | 192.168.1.0/24(d)       |
                +-------------------------+

                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | New
                +-+-----------------------+
                | 192.0.0.0/8(g)          |
                +-------------------------+
                  |
                +-+-----------------------+
                | 192.168.0.0/16(g)       |
                +-------------------------+
                  |
                +-+-----------------------+
                | 192.168.1.0/24(d)       |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 16);
            dict.createGlueNodes(node, 8);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['192.0.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node, undefined, 8, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, undefined, 16, 24, ['192.168.1.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, undefined, []);
        });
        it('should create a single glue node under the middle of data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 192.168.0.0/16(d)       |
                +-------------------------+
                  |
                +-+-----------------------+
                | 192.168.129.0/24(d)     |
                +-------------------------+

                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 192.168.0.0/16(d)       |
                +-+-----------------------+
                  | New
                +-+-----------------------+
                | 192.168.128.0/17(g)     |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 192.168.129.0/24(d)     |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.push("192.168.129.0", 24, "Data of 192.168.129.0/24");
            var node = dict.getRootNode();
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            dict.createGlueNodes(node, 17);

            node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, 17, ['192.168.128.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node, undefined, 17, 24, ['192.168.129.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.129.0')];
            assertTheNode(node, 'Data of 192.168.129.0/24', 24, undefined, []);
        });

        it('should create 1 glue node over the 2 data nodes', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/24(d)     | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | New
                +-+-----------------------+
                | 192.168.0.0/16(g)       |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/24(d)     | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.push("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 16);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, undefined, 16, 24, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, 'Data of 192.168.128.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/24', 24, undefined, []);
        });

        it('should create 2 glue node that has 1 child data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/24(d)     | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/17(g)     | | 192.168.0.0/17(g)       | <- New
                +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/24(d)     | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.push("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.128.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.0.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, undefined, []);
        });

        it('should create 2 glue node that has 2 child data node and has 1 child data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.172.0/24(d)     | | 192.168.128.0/24(d)     | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+
                  | New                                                   | New
                +-+-----------------------+                             +-+-----------------------+
                | 192.168.128.0/17(g)     |                             | 192.168.0.0/17(g)       |
                +-------------------------+                             +-------------------------+
                  |                                                       |
                  +---------------------------+                           |
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.172.0/24(d)     | | 192.168.128.0/24(d)     | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.172.0", 24, "Data of 192.168.172.0/24");
            dict.push("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.push("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.172.0', '192.168.128.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.172.0')];
            assertTheNode(node2, 'Data of 192.168.172.0/24', 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.0.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, undefined, []);
        });

        it('should create 2 glue node that has 1 child data node and has 2 child data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/24(d)     | | 192.168.64.0/24(d)      | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  | New                       | New
                +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/17(g)     | | 192.168.0.0/17(g)       |
                +-------------------------+ +-+-----------------------+
                  |                           |
                  |                           +---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.128.0/24(d)     | | 192.168.64.0/24(d)      | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.push("192.168.64.0", 24, "Data of 192.168.64.0/24");
            dict.push("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.128.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.0.0', '192.168.64.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.64.0')];
            assertTheNode(node2, 'Data of 192.168.64.0/24', 24, undefined, []);
        });

        it('should create 2 glue node that has 2 child data node and has 2 child data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+---------------------------+
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.172.0/24(d)     | | 192.168.128.0/24(d)     | | 192.168.64.0/24(d)      | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  | New                                                   | New
                +-+-----------------------+                             +-+-----------------------+
                | 192.168.128.0/17(g)     |                             | 192.168.0.0/17(g)       |
                +-+-----------------------+                             +-+-----------------------+
                  |                                                       |
                  +---------------------------+                           +---------------------------+
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.172.0/24(d)     | | 192.168.128.0/24(d)     | | 192.168.64.0/24(d)      | | 192.168.0.0/24(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.172.0", 24, "Data of 192.168.172.0/24");
            dict.push("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.push("192.168.64.0", 24, "Data of 192.168.64.0/24");
            dict.push("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getRootNode();
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.172.0', '192.168.128.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.172.0')];
            assertTheNode(node2, 'Data of 192.168.172.0/24', 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, 24, ['192.168.0.0', '192.168.64.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.64.0')];
            assertTheNode(node2, 'Data of 192.168.64.0/24', 24, undefined, []);
        });
    });


    describe('#push', () => {

        /*
            (g): glue node
            (d): data node
        */
        it('should be empty node when no data has been pushed', () => {
            /*  (Structure of tree)
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-------------------------+
            */
            var node = dict.getRootNode();

            should.equal(node[I_IPV4_DATA], undefined);
            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(0);
            should.equal(node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], undefined);
            Object.keys(node[I_IPV4_REF_CHILD_NODE]).length.should.equal(0);
        });

        it('should not be able to push undefined data', () => {
            (() => {dict.push("0.0.0.0", 0, undefined)}).should.throw(TypeError, "Cannot push undefined as a data to the tree");
        });

        it('should be able to push a root node 0.0.0.0/0', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, undefined, []);
        });
        it('should be able to push a single node 128.0.0.0/1', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 1)128.0.0.0/1(d)        |
                +-------------------------+
            */
            dict.push("128.0.0.0", 1, "Data of 128.0.0.0/1");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 1, ['128.0.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('128.0.0.0')];
            assertTheNode(node, 'Data of 128.0.0.0/1', 1, undefined, []);
        });


        it('should be able to push nodes 128.0.0.0/1, 0.0.0.0/1', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1)128.0.0.0/1(d)        | | 2)0.0.0.0/1(d)          |
                +-------------------------+ +-------------------------+
            */
            dict.push("128.0.0.0", 1, "Data of 128.0.0.0/1");
            dict.push("0.0.0.0", 1, "Data of 0.0.0.0/1");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 1, ['128.0.0.0', '0.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('128.0.0.0')];
            assertTheNode(node1, 'Data of 128.0.0.0/1', 1, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('0.0.0.0')];
            assertTheNode(node1, 'Data of 0.0.0.0/1', 1, undefined, []);
        });

        it('should be able to push a node 255.255.255.255/32', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 1)255.255.255.255/32(d) |
                +-------------------------+
            */
            dict.push("255.255.255.255", 32, "Data of 255.255.255.255/32");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 32, ['255.255.255.255']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('255.255.255.255')];
            assertTheNode(node, 'Data of 255.255.255.255/32', 32, undefined, []);
        });

        it('should be able to push nodes 255.255.255.255/32, 255.255.255.254/32', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1)255.255.255.255/32(d) | | 2)255.255.255.254/32(d) |
                +-------------------------+ +-------------------------+
            */
            dict.push("255.255.255.255", 32, "Data of 255.255.255.255/32");
            dict.push("255.255.255.254", 32, "Data of 255.255.255.254/32");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 32, ['255.255.255.255', '255.255.255.254']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('255.255.255.255')];
            assertTheNode(node1, 'Data of 255.255.255.255/32', 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('255.255.255.254')];
            assertTheNode(node1, 'Data of 255.255.255.254/32', 32, undefined, []);
        });

        it('should be able to push a node 192.168.1.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 1)192.168.1.0/24(d)     |
                +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 24, ['192.168.1.0']);
            node = node[I_IPV4_REF_CHILD_NODE][-1062731520];    // -1062731520 -> 192.168.0.1
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, undefined, []);
        });

        it('should be able to push nodes 192.168.1.0/24, 192.168.2.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 2) 192.168.2.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 24, ['192.168.1.0', '192.168.2.0']);

            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, 'Data of 192.168.2.0/24', 24, undefined, []);
        });

        it('should be able to push nodes 192.168.0.0/16, 192.168.1.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.0.0/16(d)    |
                +-------------------------+
                  |
                +-+-----------------------+
                | 2) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");

            var node1 = dict.getRootNode();
            assertTheNode(node1, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/16', 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
        });

        it('should be able to push nodes 192.168.0.0/16, 192.168.1.0/24, 192.168.2.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.0.0/16(d)    |
                +-------------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 2) 192.168.1.0/24(d)    | | 3) 192.168.2.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, 24, ['192.168.1.0', '192.168.2.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, 'Data of 192.168.2.0/24', 24, undefined, []);
        });

        it('should be able to push nodes 192.168.0.0/16, 192.168.1.0/24, 172.16.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.0.0/16(d)    | | 3) 172.16.0.0/16(d)     |
                +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 2) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/16', 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, undefined, []);
        });

        it('should be able to push nodes 192.168.1.0/24, 192.168.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 2) 192.168.0.0/16(d)    |
                +-------------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, 24, ['192.168.1.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, undefined, []);
        });

        it('should be able to push nodes 192.168.1.0/24, 192.168.0.0/16, 192.168.2.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 2) 192.168.0.0/16(d)    |
                +-------------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 3) 192.168.2.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, 24, ['192.168.1.0', '192.168.2.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, 'Data of 192.168.2.0/24', 24, undefined, []);
        });

        it('should be able to push nodes 192.168.1.0/24, 192.168.0.0/16, 172.16.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 2) 192.168.0.0/16(d)    | | 3) 172.16.0.0/16(d)     |
                +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 16, ['192.168.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/16', 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, undefined, []);
        });


        it('should be able to push nodes 192.168.1.0/24, 192.168.0.0/16, 192.0.0.0/8', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 3) 192.0.0.0/8(d)       |
                +-------------------------+
                  |
                +-+-----------------------+
                | 2) 192.168.0.0/16(d)    |
                +-------------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.push("192.0.0.0", 8, "Data of 192.0.0.0/8");

            var node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 8, ['192.0.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node, "Data of 192.0.0.0/8", 8, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, "Data of 192.168.0.0/16", 16, 24, ['192.168.1.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, "Data of 192.168.1.0/24", 24, undefined, []);
        });

        it('should be able to push nodes 192.168.1.0/24, 192.0.0.0/8, 192.168.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 2) 192.0.0.0/8(d)       |
                +-------------------------+
                  |
                +-+-----------------------+
                | 3) 192.168.0.0/16(d)    |
                +-------------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.0.0.0", 8, "Data of 192.0.0.0/8");
            dict.push("192.168.0.0", 16, "Data of 192.168.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 8, ['192.0.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node, "Data of 192.0.0.0/8", 8, 16, ['192.168.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, "Data of 192.168.0.0/16", 16, 24, ['192.168.1.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, "Data of 192.168.1.0/24", 24, undefined, []);
        });

        it('should be able to push nodes 192.168.1.0/24, 172.16.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  | Create a glue node        |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 2) 172.16.0.0/16(d)     |
                +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 1) 192.168.1.0/24(d)    |
                +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 16, ['192.168.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, undefined, []);
        });

        function assertSetType3(dict) {
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 16, ['192.168.0.0', '192.169.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.169.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node1, "Data of 192.169.1.0/24", 24, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, undefined, []);
        }


        it('should be able to push nodes 192.168.1.0/24, 192.169.1.0/24, 172.16.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  | Create a glue node        | Create a glue node        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 3)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 2) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            assertSetType3(dict);
        });

        it('should be able to push nodes 192.168.1.0/24, 172.16.0.0/16, 192.169.1.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  | Create a glue node        | Create a glue node        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 2)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 3) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            assertSetType3(dict);
        });

        function assertSetType5(dict) {
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 8, ['192.0.0.0', '172.0.0.0', '10.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['192.168.0.0', '192.169.0.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, undefined, 16, 24, ['192.168.1.0']);
            node2 = node2[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node2, "Data of 192.168.1.0/24", 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node2, "Data of 192.169.0.0/16", 16, 24, ['192.169.1.0']);
            node2 = node2[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node2, "Data of 192.169.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);

             node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, "Data of 10.0.0.0/8", 8, undefined, []);
        }

        it('should be able to push nodes 192.168.1.0/24, 192.168.1.0/24, 172.16.0.0/16, 10.0.0.0/8, 192.169.0.0/16', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  | Create a glue node                                    | Create a glue node        |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 4)10.0.0.0/8(d)         |
                +-+-----------------------+                             +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+ Create a glue node        |
                  | Create a glue node        | then update it            |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 5)192.169.0.0/16(d)     | | 3)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 2) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("192.169.0.0", 16, "Data of 192.169.0.0/16");
            assertSetType5(dict);
        });

        it('should be able to push nodes 192.168.1.0/24, 172.16.0.0/16, 192.169.0.0/16, 192.168.1.0/24, 10.0.0.0/8', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  | Create a glue node                                    | Create a glue node        |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 5)10.0.0.0/8(d)         |
                +-+-----------------------+                             +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+ Create a data node        |
                  | Create a glue node        | then push a data node     |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 3) 192.169.0.0/16(g)    | | 2)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 4) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            assertSetType5(dict);
        });

        // 
        it('should be able to push nodes 192.168.1.0/24, 172.16.0.0/16, 192.169.0.0/16, 192.168.1.0/24, 10.0.0.0/8', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  | Create a glue node                                    | Create a glue node        |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 5)10.0.0.0/8(d)         |
                +-+-----------------------+                             +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+ Create a glue node        |
                  | Create a glue node        | then update it            |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 4)192.169.0.0/16(g)     | | 2)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 1) 192.168.1.0/24(d)    | | 3) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.push("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            assertSetType5(dict);
        });

        it('should be able to push nodes 10.0.0.0/8, 172.16.0.0/16, 192.168.1.0/24, 192.169.0.0/16, 192.168.1.0/24', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  | Create a glue node                                    | Create a glue node        |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 1)10.0.0.0/8(d)         |
                +-+-----------------------+                             +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+                           |
                  | Create a glue node        | Create a glue node        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 4)192.169.0.0/16(g)       | | 2)172.16.0.0/16(d)    |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 5) 192.168.1.0/24(d)    | | 3) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.push("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            assertSetType5(dict);
        });

        it('should be able to push nodes 10.0.0.0/8, 172.16.0.0/16, 192.168.1.0/24, 192.169.0.0/16, 192.168.1.0/24' , () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  | Create a glue node                                    | Create a glue node        |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 1)10.0.0.0/8(d)         |
                +-+-----------------------+                             +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+                           |
                  | Create a glue node        | Create a glue node        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 4)192.169.0.0/16(g)     | | 3)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 2) 192.168.1.0/24(d)    | | 5) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            assertSetType5(dict);
        });

        it('should remove the glue node with only one glue node under pushed node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/27(d)       | | 192.168.1.0/27(d)       |
                +-------------------------+ +-------------------------+
                // > push 192.168.2.0/26 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/26(g)       | | 192.168.1.0/26(g)       | | 192.168.2.0/26(d)       |
                +-+-----------------------+ +-+-----------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/27(d)       | | 192.168.1.0/27(d)       |
                +-------------------------+ +-------------------------+
                // > push 192.168.3.0/25 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+---------------------------+
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/25(g)       | | 192.168.1.0/25(g)       | | 192.168.2.0/25(g)       | | 192.168.3.0/25(d)       |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-------------------------+
                  |                           |                           |
                  | deleted                   | deleted                 +-+-----------------------+
                  | (192.168.0.0/26(g))       | (192.168.1.0/26(g))     | 192.168.2.0/26(d)       |
                  |                           |                         +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/27(d)       | | 192.168.1.0/27(d)       |
                +-------------------------+ +-------------------------+
                // > push 192.168.4.0/24 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+---------------------------+---------------------------+
                  |                           |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/24(g)       | | 192.168.1.0/24(g)       | | 192.168.2.0/24(g)       | | 192.168.3.0/24(g)       | | 192.168.4.0/24(d)       |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                  |                           |                           |                           |
                  | deleted                   | deleted                   | deleted                 +-+-----------------------+
                  | (192.168.0.0/25(g))       | (192.168.1.0/25(g))       | (192.168.2.0/25(g))     | 192.168.3.0/25(d)       |
                  |                           |                           |                         +-------------------------+
                  |                           |                           |
                  |                           |                         +-+-----------------------+
                  |                           |                         | 192.168.2.0/26(d)       |
                  |                           |                         +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/27(d)       | | 192.168.1.0/27(d)       |
                +-------------------------+ +-------------------------+
            */
            dict.push("192.168.0.0", 27, "Data of 192.168.0.0/27");
            dict.push("192.168.1.0", 27, "Data of 192.168.1.0/27");

            // > push 192.168.2.0/26 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.push("192.168.2.0", 26, "Data of 192.168.2.0/26");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 26, ["192.168.0.0", "192.168.1.0", "192.168.2.0"]);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 26, 27, ['192.168.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, "Data of 192.168.0.0/27", 27, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, undefined, 26, 27, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/27", 27, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, "Data of 192.168.2.0/26", 26, undefined, []);

            // > push 192.168.3.0/25 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.push("192.168.3.0", 25, "Data of 192.168.3.0/25");
            node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 25, ["192.168.0.0", "192.168.1.0", "192.168.2.0", "192.168.3.0"]);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 25, 27, ["192.168.0.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, "Data of 192.168.0.0/27", 27, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, undefined, 25, 27, ["192.168.1.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/27", 27, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, undefined, 25, 26, ["192.168.2.0"]);
            node1= node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, "Data of 192.168.2.0/26", 26, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.0')];
            assertTheNode(node1, "Data of 192.168.3.0/25", 25, undefined, []);

            // > push 192.168.4.0/24 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.push("192.168.4.0", 24, "Data of 192.168.4.0/24");
            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 24, ["192.168.0.0", "192.168.1.0", "192.168.2.0", "192.168.3.0", "192.168.4.0"]);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.0.0")]
            assertTheNode(node1, undefined, 24, 27, ["192.168.0.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.0.0")];
            assertTheNode(node1, "Data of 192.168.0.0/27", 27, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, undefined, 24, 27, ["192.168.1.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, "Data of 192.168.1.0/27", 27, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, undefined, 24, 26, ["192.168.2.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, "Data of 192.168.2.0/26", 26, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.3.0")];
            assertTheNode(node1, undefined, 24, 25, ["192.168.3.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.3.0")];
            assertTheNode(node1, "Data of 192.168.3.0/25", 25, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.4.0")];
            assertTheNode(node1, "Data of 192.168.4.0/24", 24, undefined, []);
        });
    });

    describe('#rebalanceChildGlueNode', () => {
        it('should do nothing if the node has no child nodes', () => {
            var node = ["dummy", 0, undefined, {}];
            dict.rebalanceChildGlueNode(node);
            assertTheNode(node, "dummy", 0, undefined, []);
        });

        it('should do nothing if tha node has child node that has subnet length 32', () => {
            var node = ["dummy", 0, 32, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.1')] = ["Data of 192.168.1.1/32", 32, undefined, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.2')] = ["Data of 192.168.1.2/32", 32, undefined, {}];

            dict.rebalanceChildGlueNode(node);
            assertTheNode(node, "dummy", 0, 32, ['192.168.1.1', '192.168.1.2']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.1')];
            assertTheNode(node1, "Data of 192.168.1.1/32", 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.2')];
            assertTheNode(node1, "Data of 192.168.1.2/32", 32, undefined, []);
        });

        it('should do nothing if one of the node is data node', () => {
             /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           |
                +-------------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          | | 172.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                  |                           |
                  |                         +-+-----------------------+
                  |                         | 172.16.0.0/8(d)         |
                  |                         +-------------------------+
                  |
                +-+-----------------------+
                | 192.168.1.0/24(d)       |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.rebalanceChildGlueNode(dict.getRootNode());
            var node = dict.getRootNode();

            assertTheNode(node, "Data of 0.0.0.0/0", 0, 8, ['192.0.0.0', '172.0.0.0', '10.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, "Data of 10.0.0.0/8", 8, undefined, []);
        });

        it('should only delete glue node if the all glue node has subnetmask 31', () => {
             /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           | (deleted)                 |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/31(g)       | | 172.16.1.0/31(g)        | | 192.168.3.0/31(g)       |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+                           +---------------------------+
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.1.1/32(d)       | | 192.168.1.0/32(d)       | | 192.168.3.1/32(d)       | | 192.168.3.0/32(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
                > rebalance >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+---------------------------+
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.1.1/32(d)       | | 192.168.1.0/32(d)       | | 192.168.3.1/32(d)       | | 192.168.3.0/32(d)       |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
            */
            var node = dict.getRootNode();
            node = ["Data of 0.0.0.0/0", 0, 31, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')] = [undefined, 31, 32, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.0')] = [undefined, 31, 32, {}];
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.1')] = ["Data of 192.168.1.1/32", 32, undefined, {}];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')] = ["Data of 192.168.1.0/32", 32, undefined, {}];
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.1')] = ["Data of 192.168.3.1/32", 32, undefined, {}];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.0')] = ["Data of 192.168.3.0/32", 32, undefined, {}];

            dict.rebalanceChildGlueNode(node);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 32, ['192.168.1.0', '192.168.1.1', '192.168.3.0', '192.168.3.1']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/32', 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.1')];
            assertTheNode(node1, 'Data of 192.168.1.1/32', 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.0')];
            assertTheNode(node1, 'Data of 192.168.3.0/32', 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.3.1')];
            assertTheNode(node1, 'Data of 192.168.3.1/32', 32, undefined, []);
        });

        it('should only delete glue node and link the nodes under glue nodes with child of child nodes', () => {
             /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | target
                +-------------------------+
                | 172.0.0.0/8(d)          |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           | deleted
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 172.16.0.0/16(g)        | | 172.17.0.0/16(g)        | | 172.18.0.0/16(d)        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                  |                           |
                  |                           +---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 172.16.1.0/24(d)        | | 172.17.1.0/24(d)        | | 172.17.2.0/24(d)        |
                +-+-----------------------+ +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.1.1/32(d)        |
                +-------------------------+
                > rebalance >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | target
                +-------------------------+
                | 172.0.0.0/8(d)          |
                +-+-----------------------+
                  |
                  |---------------------------+---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 172.16.1.0/24(d)        | | 172.17.1.0/24(d)        | | 172.17.2.0/24(d)        |
                +-+-----------------------+ +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.1.1/32(d)        |
                +-------------------------+
            */
            var root = ["Data of 0.0.0.0/0", 0, 8, {}];
            root[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')] = ["Data of 172.0.0.0/8", 8, 16, {}];
            var node = root[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')] = [undefined, 16, 24, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.0.0')] = [undefined, 16, 24, {}];

            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')] = ["Data of 172.16.1.0/24", 24, 32, {}];
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.1')] = ["Data of 172.16.1.1/32", 32, undefined, {}];

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.0.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.0')] = ["Data of 172.17.1.0/24", 24, undefined, {}];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.2.0')] = ["Data of 172.17.2.0/24", 24, undefined, {}];

            dict.rebalanceChildGlueNode(node);
            assertTheNode(root, "Data of 0.0.0.0/0", 0, 8, ["172.0.0.0"]);
            node = root[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node, "Data of 172.0.0.0/8", 8, 24, ['172.16.1.0', '172.17.1.0', '172.17.2.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')];
            assertTheNode(node1, "Data of 172.16.1.0/24", 24, 32, ['172.16.1.1']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.1')];
            assertTheNode(node1, "Data of 172.16.1.1/32", 32, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.0')];
            assertTheNode(node1, "Data of 172.17.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.2.0')];
            assertTheNode(node1, "Data of 172.17.2.0/24", 24, undefined, []);
        });

        it('should only delete glue node and link the nodes under glue nodes with creating new glue nodes', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | target
                +-------------------------+
                | 172.0.0.0/8(d)          |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+---------------------------+
                  |                           |                           |                           | (deleted)
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 172.16.0.0/16(g)        | | 172.17.0.0/16(g)        | | 172.18.0.0/16(g)        | | 172.19.0.0/16(d)        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                  |                           |                           |
                  |                           |                         +-+-----------------------+
                  |                           |                         | 172.18.1.0/24(d)        |
                  |                           |                         +-------------------------+
                  |                           |
                +-+-----------------------+   |
                | 172.16.1.0/25(d)        |   |
                +-+-----------------------+   |
                  |                           |
                  |                           +---------------------------+
                  |                           |                           |
                  |                         +-+-----------------------+ +-+-----------------------+
                  |                         | 172.17.1.0/26(d)        | | 172.17.1.64/26(d)       |
                  |                         +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.1.1/32(d)        |
                +-------------------------+
                > rebalance >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | target
                +-------------------------+
                | 172.0.0.0/8(d)          |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  | new                       | new                       |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 172.16.1.0/24(g)        | | 172.17.1.0/24(g)        | | 172.18.1.0/24(d)        |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                  |                           |
                +-+-----------------------+   |
                | 172.16.1.0/25(d)        |   |
                +-+-----------------------+   |
                  |                           |
                  |                           +---------------------------+
                  |                           |                           |
                  |                         +-+-----------------------+ +-+-----------------------+
                  |                         | 172.17.1.0/26(d)        | | 172.17.1.64/26(d)       |
                  |                         +-------------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.1.1/32(d)        |
                +-------------------------+
            */
            var root = ["Data of 0.0.0.0/0", 0, 8, {}];
            root[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')] = ["Data of 172.0.0.0/8", 8, 16, {}];

            var node = root[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')] = [undefined, 16, 25, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.0.0')] = [undefined, 16, 26, {}];
            node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.18.0.0')] = [undefined, 16, 24, {}];

            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')] = ["Data of 172.16.1.0/25", 25, 32, {}];
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.1')] = ["Data of 172.16.1.1/32", 32, undefined, {}];

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.0.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.0')] = ["Data of 172.17.1.0/26", 26, undefined, {}];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.64')] = ["Data of 172.17.1.64/26", 26, undefined, {}];

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.18.0.0')];
            node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.18.1.0')] = ["Data of 172.18.1.0/24", 24, undefined, {}];

            dict.rebalanceChildGlueNode(node);

            assertTheNode(root, "Data of 0.0.0.0/0", 0, 8, ['172.0.0.0']);
            node = root[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node, "Data of 172.0.0.0/8", 8, 24, ['172.16.1.0', '172.17.1.0', '172.18.1.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')];
            assertTheNode(node1, undefined, 24, 25, ['172.16.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')];
            assertTheNode(node1, "Data of 172.16.1.0/25", 25, 32, ['172.16.1.1']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.1')];
            assertTheNode(node1, "Data of 172.16.1.1/32", 32, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.0')];
            assertTheNode(node1, undefined, 24, 26, ['172.17.1.0', '172.17.1.64']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.0')];
            assertTheNode(node2, "Data of 172.17.1.0/26", 26, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.1.64')];
            assertTheNode(node2, "Data of 172.17.1.64/26", 26, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.18.1.0')];
            assertTheNode(node1, "Data of 172.18.1.0/24", 24, undefined, []);
        });
    });

    describe('#delete', () => {
        function createTree01() {
             /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  |                                                       |                           |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+                             +-+-----------------------+ +-+-----------------------+
                  |                                                       |
                  +---------------------------+                           |
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 172.16.0.0/16(d)        |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.push("192.169.1.0", 24, "Data of 192.168.1.0/24");
        }

        it('should delete a root data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-------------------------+
            */
            dict.push('0.0.0.0', 0, "Data of 0.0.0.0/0");
            dict.delete("0.0.0.0", 0).should.equal("Data of 0.0.0.0/0");;

            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, undefined, []);
        });

        it('should delete a single data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 255.255.128./17(d)      |
                +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.delete("10.0.0.0", 8).should.equal("Data of 10.0.0.0/8");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, undefined, []);
        });

        it('should delete a single root node', () => {
            /*
                 delete
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 255.255.128./17(d)      |
                +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 255.255.128./17(d)      |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.delete("10.0.0.0", 8).should.equal("Data of 10.0.0.0/8");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, undefined, []);
        });

        it('should delete subnet the data that has length of subnetmask 18', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 255.255.128.0/17(d)     |
                +-+-----------------------+
                  | delete
                +-+-----------------------+
                | 255.255.192.0/18(d)     |
                +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 255.255.128.0/17(d)     |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("255.255.128.0", 17, "Data of 255.255.128.0/17");
            dict.push("255.255.192.0", 18, "Data of 255.255.192.0/18");
            dict.delete("255.255.192.0", 18).should.equal("Data of 255.255.192.0/18");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 17, ['255.255.128.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('255.255.128.0')];
            assertTheNode(node, 'Data of 255.255.128.0/17', 17, undefined, []);
        });

        it('should delete middle of data that has length of subnetmask 17', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  | delete
                +-+-----------------------+
                | 255.255.128./17(d)      |
                +-------------------------+
                  |
                +-+-----------------------+
                | 255.255.192.0/18(d)     |
                +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 255.255.192.0/18(d)     |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("255.255.128.0", 17, "Data of 255.255.128.0/17");
            dict.push("255.255.192.0", 18, "Data of 255.255.192.0/18");
            dict.delete("255.255.128.0", 17).should.equal("Data of 255.255.128.0/17");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 18, ['255.255.192.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('255.255.192.0')];
            assertTheNode(node, 'Data of 255.255.192.0/18', 18, undefined, []);
        });

        it('should delete a single node under the glue node that has 2 node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          |
                +-+-----------------------+ +-------------------------+
                                              |
                                              +---------------------------+
                                              |                           | delete
                                            +-+-----------------------+ +-+-----------------------+
                                            | 172.16.0.0/16(d)        | | 172.17.0.0/16(d)        |
                                            +-------------------------+ +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          |
                +-+-----------------------+ +-------------------------+
                                              |
                                            +-+-----------------------+
                                            | 172.16.0.0/16(d)        |
                                            +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.0.0.0", 8, "Data of 172.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("172.17.0.0", 16, "Data of 172.17.0.0/16");
            dict.delete("172.17.0.0", 16).should.equal("Data of 172.17.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['10.0.0.0', '172.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, 'Data of 10.0.0.0/8', 8, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, 'Data of 172.0.0.0/8', 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, undefined, []);
        });

        it('should delete a single data node under glue node that has 1 child node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          | <- glue node that has 1 child node
                +-+-----------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+   |
                | 10.1.0.0/16(d)          |   |
                +-+-----------------------+   |
                                              | delete
                                            +-+-----------------------+
                                            | 172.16.1.0/24(d)        |
                                            +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 10.0.0.0/8(d)           |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 10.1.0.0/16(d)          |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("10.1.0.0", 16, "Data of 10.1.0.0/16");
            dict.push("172.16.1.0", 24, "Data of 172.16.1.0/24");
            dict.delete("172.16.1.0", 24).should.equal("Data of 172.16.1.0/24");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['10.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, 'Data of 10.0.0.0/8', 8, 16, ['10.1.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.1.0.0')];
            assertTheNode(node1, 'Data of 10.1.0.0/16', 16, undefined, []);
        });

        it('should delete a single data node under 1 data node that has 1 child node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          |
                +-+-----------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.1.0.0/16(d)          | | 172.16.0.0/16(d)        | <- 1 data node that has 1 child node
                +-+-----------------------+ +-------------------------+
                                              | delete
                                            +-+-----------------------+
                                            | 172.16.1.0/24(d)        |
                                            +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          |
                +-+-----------------------+ +-+-----------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.1.0.0/16(d)          | | 172.16.0.0/16(d)        |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("10.1.0.0", 16, "Data of 10.1.0.0/16");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("172.16.1.0", 24, "Data of 172.16.1.0/24");
            dict.delete("172.16.1.0", 24).should.equal("Data of 172.16.1.0/24");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['10.0.0.0', '172.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, 'Data of 10.0.0.0/8', 8, 16, ['10.1.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.1.0.0')];
            assertTheNode(node1, 'Data of 10.1.0.0/16', 16, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, undefined, []);
        });

        it('should delete a single data node under 1 glue node that has 1 child node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(d)          |
                +-+-----------------------+ +-------------------------+
                  |                           |
                  |                           +---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 10.1.0.0/16(d)          | | 172.16.0.0/16(g)        | | 172.17.0.0/16(d)        |
                +-+-----------------------+ +-------------------------+ +-------------------------+
                                              | delete
                                            +-+-----------------------+
                                            | 172.16.1.0/24(d)        |
                                            +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(d)          |
                +-+-----------------------+ +-------------------------+
                  |
                +-+-----------------------+
                | 10.1.0.0/16(d)          |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("10.1.0.0", 16, "Data of 10.1.0.0/16");
            dict.push("172.0.0.0", 8, "Data of 172.0.0.0/8");
            dict.push("172.17.0.0", 16, "Data of 172.17.0.0/16");
            dict.push("172.16.1.0", 24, "Data of 172.16.1.0/24");
            dict.delete("172.16.1.0", 24).should.equal("Data of 172.16.1.0/24");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['10.0.0.0', '172.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, 'Data of 10.0.0.0/8', 8, 16, ['10.1.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.1.0.0')];
            assertTheNode(node1, 'Data of 10.1.0.0/16', 16, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, 'Data of 172.0.0.0/8', 8, 16, ['172.17.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.17.0.0')];
            assertTheNode(node1, 'Data of 172.17.0.0/16', 16, undefined, []);
        });

        it('should delete a single data node under 1 glue node that has 1 child node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(d)          |
                +-+-----------------------+ +-------------------------+
                  |                           | delete
                +-+-----------------------+ +-+-----------------------+
                | 10.1.0.0/16(d)          | | 172.16.0.0/16(d)        |
                +-+-----------------------+ +-------------------------+
                                              |
                                              +---------------------------+
                                              |                           |
                                            +-+-----------------------+ +-+-----------------------+
                                            | 172.16.1.0/24(d)        | | 172.16.2.0/24(d)        |
                                            +-------------------------+ +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(d)          |
                +-+-----------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+   |
                | 10.1.0.0/16(d)          |   |
                +-+-----------------------+   |
                                              |
                                              +---------------------------+
                                              |                           |
                                            +-+-----------------------+ +-+-----------------------+
                                            | 172.16.1.0/24(d)        | | 172.16.2.0/24(d)        |
                                            +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("10.1.0.0", 16, "Data of 10.1.0.0/16");
            dict.push("172.0.0.0", 8, "Data of 172.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("172.16.1.0", 24, "Data of 172.16.1.0/24");
            dict.push("172.16.2.0", 24, "Data of 172.16.2.0/24");
            dict.delete("172.16.0.0", 16).should.equal("Data of 172.16.0.0/16");

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['10.0.0.0', '172.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, 'Data of 10.0.0.0/8', 8, 16, ['10.1.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.1.0.0')];
            assertTheNode(node1, 'Data of 10.1.0.0/16', 16, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, 'Data of 172.0.0.0/8', 8, 24, ['172.16.1.0', '172.16.2.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.1.0')];
            assertTheNode(node2, 'Data of 172.16.1.0/24', 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.2.0')];
            assertTheNode(node2, 'Data of 172.16.2.0/24', 24, undefined, []);
        });

        it('should delete a single data node with parent glue node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          |
                +-+-----------------------+ +-------------------------+
                                              | delete
                                            +-+-----------------------+
                                            | 172.16.0.0/16(d)        |
                                            +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 10.0.0.0/8(d)           |
                +-+-----------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.delete("172.16.0.0", 16).should.equal("Data of 172.16.0.0/16");;

            var node = dict.getRootNode();
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, 8, ['10.0.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node, "Data of 10.0.0.0/8", 8, undefined, []);
        });

        it('should delete a single data node with rebalancing glue node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  | delete                    |
                +-+-----------------------+ +-+-----------------------+
                | 10.0.0.0/8(d)           | | 172.0.0.0/8(g)          |
                +-------------------------+ +-------------------------+
                                              |
                                            +-+-----------------------+
                                            | 172.16.0.0/16(d)        |
                                            +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 172.16.0.0/16(d)        |
                +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.delete("10.0.0.0", 8).should.equal("Data of 10.0.0.0/8");

            var node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 16, ['172.16.0.0']);
            node = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node, "Data of 172.16.0.0/16", 16, undefined, []);
        });
    });

    describe('#find', () => {
        it('should return root node if existed', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
        });


        it('should return undefined if no data has been registered', () => {
            should.not.exist(dict.find("0.0.0.0"));
            should.not.exist(dict.find("192.168.1.10"));
            should.not.exist(dict.find("172.16.0.1"));
        });

        it('should return data if data has been registered in key 0.0.0.0/0', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
            dict.find("10.0.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("172.16.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("192.168.1.1").should.equal("Data of 0.0.0.0/0");
        });

        it('should return data for 0.0.0.0/0, 192.168.1.0/24', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
            dict.find("10.0.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("172.16.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("192.168.1.1").should.equal("Data of 192.168.1.0/24");
        });

        it('should return data for 0.0.0.0/0, 10.0.0.0/8, 172.16.0.0/16, 192.168.1.0/24', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.1", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.1", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
            dict.find("10.0.0.1").should.equal("Data of 10.0.0.0/8");
            dict.find("172.16.0.1").should.equal("Data of 172.16.0.0/16");
            dict.find("192.168.1.1").should.equal("Data of 192.168.1.0/24");
        });
        it('should return undefined(data of 0.0.0.0/0) if data which appropriate is not found', () => {
            dict.push("10.0.0.1", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.1", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            should.not.exist(dict.find("0.0.0.0"));
            should.not.exist(dict.find("11.0.0.1"));
            should.not.exist(dict.find("172.17.0.1"));
            should.not.exist(dict.find("192.168.2.1"));
        });
    });

    describe('#integrated test', () => {
        it('should pass integration test 01', () => {
             /*
                 1) delete
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-----------------------------------------------------------------------------------+---------------------------+
                  |                                                                                   |                           |
                +-------------------------+                                                         +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                                                         | 172.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+                                                         +-+-----------------------+ +-------------------------+
                  |                                                                                   |
                  +---------------------------+---------------------------+                           |
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 192.170.0.0/16(d)       | | 172.16.0.0/16(d)        |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +-----------------------------------------------------------------------------------+---------------------------+
                  |                                                                                   |                           | 2) delete
                +-------------------------+                                                         +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                                                         | 172.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+                                                         +-+-----------------------+ +-+-----------------------+
                  |                                                                                   |
                  +---------------------------+---------------------------+                           |
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 192.170.0.0/16(d)       | | 172.16.0.0/16(d)        |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+---------------------------+
                  |                           |                           |                           | 3) delete
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 192.170.0.0/16(d)       | | 172.16.0.0/16(d)        |
                +-+-----------------------+ +-+-----------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           | 4) delete
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 192.170.0.0/16(d)       |
                +-+-----------------------+ +-+-----------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > delete >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > add 0.0.0.0/0 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > add 10.0.0.0/8 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-------------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+ +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
                > add 172.16.0.0/16 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+---------------------------+
                  |                                                       |                           |
                +-------------------------+                             +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                             | 172.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+                             +-+-----------------------+ +-------------------------+
                  |                                                       |
                  +---------------------------+                           |
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       | | 172.16.0.0/16(d)        |
                +-------------------------+ +-------------------------+ +-+-----------------------+
                > add 192.170.0.0/16 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-----------------------------------------------------------------------------------+---------------------------+
                  |                                                                                   |                           |
                +-------------------------+                                                         +-+-----------------------+ +-+-----------------------+
                | 192.0.0.0/8(g)          |                                                         | 172.0.0.0/8(g)          | | 10.0.0.0/8(d)           |
                +-+-----------------------+                                                         +-+-----------------------+ +-------------------------+
                  |                                                                                   |
                  +---------------------------+---------------------------+                           |
                  |                           |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.0.0/16(g)       | | 192.169.0.0/16(g)       | | 192.170.0.0/16(d)       | | 172.16.0.0/16(d)        |
                +-------------------------+ +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(d)       | | 192.169.1.0/24(d)       |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.170.0.0", 16, "Data of 192.170.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.delete("0.0.0.0", 0);
            // ---------------------------------------------------------

            var node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 8, ['192.0.0.0', '172.0.0.0', '10.0.0.0']);
            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['192.168.0.0', '192.169.0.0', '192.170.0.0']);
            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, undefined, 16, 24, ['192.168.1.0']);
            node2 = node2[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node2, 'Data of 192.168.1.0/24', 24, undefined, []);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node2, undefined, 16, 24, ['192.169.1.0']);
            node2 = node2[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node2, 'Data of 192.169.1.0/24', 24, undefined, []);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.170.0.0')];
            assertTheNode(node2, 'Data of 192.170.0.0/16', 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, 'Data of 10.0.0.0/8', 8, undefined, []);

            // ---------------------------------------------------------

            dict.delete('10.0.0.0', 8);
            node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 16, ['192.168.0.0', '192.169.0.0', '192.170.0.0', '172.16.0.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.169.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node1, "Data of 192.169.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.170.0.0')];
            assertTheNode(node1, "Data of 192.170.0.0/16", 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);

            // --------------------------------------------------------------

            dict.delete('172.16.0.0', 16);
            node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 16, ['192.168.0.0', '192.169.0.0', '192.170.0.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node1, undefined, 16, 24, ['192.169.1.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node1, "Data of 192.169.1.0/24", 24, undefined, []);

            // -----------------------------------------------------------------
            dict.delete('192.170.0.0', 16);
            node = dict.getRootNode();
            assertTheNode(node, undefined, 0, 24, ['192.168.1.0', '192.169.1.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node1, "Data of 192.169.1.0/24", 24, undefined, []);

            // -----------------------------------------------------------------
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 24, ['192.168.1.0', '192.169.1.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node1, "Data of 192.169.1.0/24", 24, undefined, []);

            // -----------------------------------------------------------------
            dict.push("10.0.0.0", 8, "Data of 10.0.0.0/8");
            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 8, ['192.0.0.0', '10.0.0.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, 24, ['192.168.1.0', '192.169.1.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node2, "Data of 192.168.1.0/24", 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node2, "Data of 192.169.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, "Data of 10.0.0.0/8", 8, undefined, []);

            // -----------------------------------------------------------------
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 8, ['192.0.0.0', '172.0.0.0', '10.0.0.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, 24, ['192.168.1.0', '192.169.1.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node2, "Data of 192.168.1.0/24", 24, undefined, []);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node2, "Data of 192.169.1.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, "Data of 10.0.0.0/8", 8, undefined, []);

            // -----------------------------------------------------------------
            dict.push('192.170.0.0', 16, "Data of 192.170.0.0/16");
            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 8, ['192.0.0.0', '172.0.0.0', '10.0.0.0']);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['192.168.0.0', '192.169.0.0', '192.170.0.0']);
            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, undefined, 16, 24, ['192.168.1.0']);
            node2 = node2[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node2, "Data of 192.168.1.0/24", 24, undefined, []);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node2, undefined, 16, 24, ['192.169.1.0']);
            node2 = node2[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node2, "Data of 192.169.1.0/24", 24, undefined, []);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('192.170.0.0')];
            assertTheNode(node2, "Data of 192.170.0.0/16", 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, "Data of 10.0.0.0/8", 8, undefined, []);
        });
        it('should pass integration tet 02', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(g)       | | 192.168.2.0/24(g)       | | 172.16.8.0/24(d)        |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/32(d)       | | 192.168.2.0/32(d)       |
                +-------------------------+ +-------------------------+
                // > push 172.16.0.0/16 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+
                  |                                                       |
                +-+-----------------------+                             +-+-----------------------+
                | 192.168.0.0/16(g)       |                             | 172.16.0.0/16(d)        |
                +-+-----------------------+                             +-------------------------+
                  |                                                       |
                  |                                                     +-+-----------------------+
                  |                                                     | 172.16.8.0/24(d)        |
                  +---------------------------+                         +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/32(d)       | | 192.168.2.0/32(d)       |
                +-------------------------+ +-------------------------+
                // > delete 172.16.8.0/24 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +-------------------------------------------------------+
                  |                                                       |
                +-+-----------------------+                             +-+-----------------------+
                | 192.168.0.0/16(g)       |                             | 172.16.0.0/16(d)        |
                +-+-----------------------+                             +-------------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/32(d)       | | 192.168.2.0/32(d)       |
                +-------------------------+ +-------------------------+
                // > delete 172.16.0.0/16 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                  +---------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/32(d)       | | 192.168.2.0/32(d)       |
                +-------------------------+ +-------------------------+
                // > push 172.16.7.0/24 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-+-----------------------+
                  |
                  +---------------------------+---------------------------+
                  |                           |                           |
                +-+-----------------------+ +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/24(g)       | | 192.168.2.0/24(g)       | | 172.16.7.0/24(d)        |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 192.168.1.0/32(d)       | | 192.168.2.0/32(d)       |
                +-------------------------+ +-------------------------+
            */
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 32, "Data of 192.168.1.0/32");
            dict.push("192.168.2.0", 32, "Data of 192.168.2.0/32");
            dict.push("172.16.8.0", 24, "Data of 172.16.8.0/24");

            var node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 24, ["192.168.1.0", "192.168.2.0", "172.16.8.0"]);

            var node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("172.16.8.0")];
            assertTheNode(node1, "Data of 172.16.8.0/24", 24, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, undefined, 24, 32, ["192.168.1.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, "Data of 192.168.1.0/32", 32, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, undefined, 24, 32, ["192.168.2.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, "Data of 192.168.2.0/32", 32, undefined, []);

            // > push 172.16.0.0/16 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");

            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 16, ["192.168.0.0", "172.16.0.0"]);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.0.0")];
            assertTheNode(node1, undefined, 16, 32, ["192.168.1.0", "192.168.2.0"]);

            var node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node2, "Data of 192.168.1.0/32", 32, undefined, []);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node2, "Data of 192.168.2.0/32", 32, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("172.16.0.0")];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, 24, ["172.16.8.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("172.16.8.0")];
            assertTheNode(node1, "Data of 172.16.8.0/24", 24, undefined, []);

            // > delete 172.16.8.0/24 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.delete("172.16.8.0", 24).should.equal("Data of 172.16.8.0/24");
            var node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 16, ["192.168.0.0", "172.16.0.0"]);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.0.0")]
            assertTheNode(node1, undefined, 16, 32, ["192.168.1.0", "192.168.2.0"]);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node2, "Data of 192.168.1.0/32", 32, undefined, []);

            node2 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node2, "Data of 192.168.2.0/32", 32, undefined, []);

            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("172.16.0.0")];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, undefined, []);

            // > delete 172.16.0.0/16 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.delete("172.16.0.0", 16).should.equal("Data of 172.16.0.0/16");
            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 32, ["192.168.1.0", "192.168.2.0"]);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, "Data of 192.168.1.0/32", 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, "Data of 192.168.2.0/32", 32, undefined, []);

            // > push 172.16.7.0/24 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            dict.push("172.16.7.0", 24, "Data of 172.16.7.0/24");
            node = dict.getRootNode();
            assertTheNode(node, "Data of 0.0.0.0/0", 0, 24, ["192.168.1.0", "192.168.2.0", "172.16.7.0"]);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, undefined, 24, 32, ["192.168.1.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.1.0")];
            assertTheNode(node1, "Data of 192.168.1.0/32", 32, undefined, []);
            node1 = node[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, undefined, 24, 32, ["192.168.2.0"]);
            node1 = node1[I_IPV4_REF_CHILD_NODE][dict.iPv4StringToBinary("192.168.2.0")];
            assertTheNode(node1, "Data of 192.168.2.0/32", 32, undefined, []);
        });
    });

    function containsIndexes(resultMapList, targetMapList) {
        if(resultMapList.length === 0 && targetMapList.length === 0) {
            console.log("ERROR: resultMapList.length === 0 && targetMapList.length === 0");
            return true;
        }
        if(resultMapList.length !== targetMapList.length) {
            console.log("ERROR: resultMapList.length !== targetMapList.length");
            return false;
        }

        for(var i = 0; i < targetMapList.length; i++) {
            var verification = false;

            for(var j = 0; j < resultMapList.length; j++) {
                if(targetMapList[i].ip === resultMapList[j].ip && targetMapList[i].mask === resultMapList[j].mask) {
                    verification = true;
                    break;
                }
            }
            if(verification === false) {
                console.log("ERROR: verification === false");
                return false;
            }
        }

        return true;
    }

    describe('#getAllIndexes', () => {
        it('should get no entries if tree is empty.', () => {
            var result = dict.getAllIndexes();
            should.not.exist(result);
        });
        it('should get entries 0.0.0.0/0 if 0.0.0.0/0 was pushed.', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            var result = dict.getAllIndexes();
            var expected = [{ip: "0.0.0.0", mask: 0}];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 0.0.0.0/0, 192.168.1.0/24 if 0.0.0.0/0, 192.168.1.0/24 was pushed.', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "0.0.0.0", mask: 0}, {ip: "192.168.1.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 192.168.1.0/24 if 192.168.1.0/24 was pushed.', () => {
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "192.168.1.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 0.0.0.0/0, 192.168.1.0/24, 192.168.2.0/24 if 0.0.0.0/0, 192.168.1.0/24, 192.168.2.0/24 was pushed.', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "0.0.0.0", mask: 0},
                {ip: "192.168.1.0", mask: 24},
                {ip: "192.168.2.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 192.168.1.0/24, 192.168.2.0/24 if 192.168.1.0/24, 192.168.2.0/24 was pushed.', () => {
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "192.168.1.0", mask: 24},
                {ip: "192.168.2.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 0.0.0.0/0, 172.16.0.0/16, 192.168.1.0/24 if 0.0.0.0/0, 172.16.0.0/16, 192.168.1.0/24 was pushed.', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "0.0.0.0", mask: 0},
                {ip: "172.16.0.0", mask: 16},
                {ip: "192.168.1.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 172.16.0.0/16, 192.168.1.0/24 if 172.16.0.0/16, 192.168.1.0/24 was pushed.', () => {
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "172.16.0.0", mask: 16},
                {ip: "192.168.1.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 0.0.0.0/0, 172.16.0.0/16, 172.17.0.0/16, 192.168.1.0/24 if 0.0.0.0/0, 172.16.0.0/16, 172.17.0.0/16, 192.168.1.0/24 was pushed.', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("172.17.0.0", 16, "Data of 172.17.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "0.0.0.0", mask: 0},
                {ip: "172.16.0.0", mask: 16},
                {ip: "172.17.0.0", mask: 16},
                {ip: "192.168.1.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 172.16.0.0/16, 172.17.0.0/16, 192.168.1.0/24 if 172.16.0.0/16, 172.17.0.0/16, 192.168.1.0/24 was pushed.', () => {
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("172.17.0.0", 16, "Data of 172.17.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "172.16.0.0", mask: 16},
                {ip: "172.17.0.0", mask: 16},
                {ip: "192.168.1.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 0.0.0.0/0, 172.16.0.0/16, 192.168.1.0/24, 192.168.2.0/24 if 0.0.0.0/0, 172.16.0.0/16, 192.168.1.0/24, 192.168.2.0/24 was pushed.', () => {
            dict.push("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "0.0.0.0", mask: 0},
                {ip: "172.16.0.0", mask: 16},
                {ip: "192.168.1.0", mask: 24},
                {ip: "192.168.2.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
        it('should get entries 172.16.0.0/16, 192.168.1.0/24, 192.168.2.0/24 if 172.16.0.0/16, 192.168.1.0/24, 192.168.2.0/24 was pushed.', () => {
            dict.push("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.push("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.push("192.168.2.0", 24, "Data of 192.168.2.0/24");
            var result = dict.getAllIndexes();
            var expected = [
                {ip: "172.16.0.0", mask: 16},
                {ip: "192.168.1.0", mask: 24},
                {ip: "192.168.2.0", mask: 24}
            ];
            should.equal(containsIndexes(result, expected), true);
        });
    });
});


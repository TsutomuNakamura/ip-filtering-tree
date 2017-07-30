var chai    = require('chai'),
    should  = chai.should();
const IPDict = require('../index').IPDict;

describe('ipdict', () => {
    var dict = undefined;

    const I_IPV4_DATA                       = 0;
    const I_IPV4_LENGTH_OF_SUBNETMASK       = 1;
    const I_IPV4_IS_GLUE_NODE               = 2;
    const I_IPV4_CHILD_ELEMENTS             = 3;

    const I_CHILD_SUBNET_LENGTH             = 0;
    const I_CHILD_NODES                     = 1;

    function assertTheNode(node, data, subnetLength, isGlueNode, subnetLengthOfChild, indexesOfChildNodes) {
        should.equal(node[I_IPV4_DATA], data);
        should.equal(node[I_IPV4_LENGTH_OF_SUBNETMASK], subnetLength);
        should.equal(node[I_IPV4_IS_GLUE_NODE], isGlueNode);
        should.equal(node[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH], subnetLengthOfChild);

        should.equal(Object.keys(node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES]).length, indexesOfChildNodes.length);
        for(var i = 0; i < indexesOfChildNodes.length; ++i) {
            should.exist(node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary(indexesOfChildNodes[i])]);
        }
    }

    beforeEach(function() {
        dict = new IPDict();
    });

    describe('#iPv4StringToBinary', () => {

        it('should convert string of IPv4 to binary', () => {
            dict.iPv4StringToBinary('0.0.0.0').should.equal(0);
            // 255.255.255.255 -> 11111111 11111111 11111111 11111111 -> -1
            dict.iPv4StringToBinary('255.255.255.255').should.equal(-1);
            // 255.255.255.0 -> 11111111 11111111 11111111 00000000 -> -256
            dict.iPv4StringToBinary('255.255.255.0').should.equal(-256);
            // 255.255.0.0 -> 11111111 11111111 00000000 00000000 -> -65536
            dict.iPv4StringToBinary('255.255.0.0').should.equal(-65536);
            // 255.0.0.0 -> 11111111 00000000 00000000 00000000 -> -16777216
            dict.iPv4StringToBinary('255.0.0.0').should.equal(-16777216);
            // 192.168.1.0     -> 11000000 10101000 00000001 00000000 -> -1062731520
            dict.iPv4StringToBinary('192.168.1.0').should.equal(-1062731520);
            // 192.168.1.0     -> 11000000 10101000 00000001 00000001 -> -1062731519
            dict.iPv4StringToBinary('192.168.1.1').should.equal(-1062731519);
            // 172.16.0.0      -> 10101100 00010000 00000000 00000000 -> -1408237568
            dict.iPv4StringToBinary('172.16.0.0').should.equal(-1408237568);
            // 10.0.0.0        -> 00001010 00000000 00000000 00000000 -> 167772160
            dict.iPv4StringToBinary('10.0.0.0').should.equal(167772160);
        });

        it('should throws exception when the invalid format of IPv4 was specified.', () => {
            // TODO: exception when invalid format was detected.
            (() => { dict.iPv4StringToBinary(''); }).should.throw(Error, ' is not a valid IPv4 address format. It\'s format must be "n.n.n.n".');
            (() => { dict.iPv4StringToBinary('foo'); }).should.throw(Error, 'foo is not a valid IPv4 address format. It\'s format must be "n.n.n.n".');
            (() => { dict.iPv4StringToBinary('0.0.0.0.0'); }).should.throw(Error, '0.0.0.0.0 is not a valid IPv4 address format. It\'s format must be "n.n.n.n".');
            (() => { dict.iPv4StringToBinary('0.0.0'); }).should.throw(Error, '0.0.0 is not a valid IPv4 address format. It\'s format must be "n.n.n.n".');

            (() => { dict.iPv4StringToBinary('0.0.0.'); }).should.throw(Error, 'Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(0.0.0.).');
            (() => { dict.iPv4StringToBinary('.255.255.255'); }).should.throw(Error, 'Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(.255.255.255).');
            (() => { dict.iPv4StringToBinary('foo.255.255.255'); }).should.throw(Error, 'Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(foo.255.255.255).');
            (() => { dict.iPv4StringToBinary('0.0.0.256'); }).should.throw(Error, 'Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(0.0.0.256).');
            (() => { dict.iPv4StringToBinary('0.0.0.-1'); }).should.throw(Error, 'Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(0.0.0.-1).');
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
            var result = dict.createNewOneNode({a: 0}, 16, false, 24, {b: 1});

            result[I_IPV4_DATA].a.should.equal(0);
            result[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(16);
            result[I_IPV4_IS_GLUE_NODE].should.equal(false);

            result[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH].should.equal(24);
            result[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES].b.should.equal(1);
        });
    });

    describe('#stringifyFromBinIPv4', () => {
        it('should convert binary IPv4 to string IPv4', () => {
            dict.stringifyFromBinIPv4(0).should.equal('0.0.0.0');
            dict.stringifyFromBinIPv4(-1).should.equal('255.255.255.255');
            dict.stringifyFromBinIPv4(-256).should.equal('255.255.255.0');
            dict.stringifyFromBinIPv4(-65536).should.equal('255.255.0.0');
            dict.stringifyFromBinIPv4(-16777216).should.equal('255.0.0.0');
            dict.stringifyFromBinIPv4(-1062731520).should.equal('192.168.1.0');
            dict.stringifyFromBinIPv4(-1408237568).should.equal('172.16.0.0');
            dict.stringifyFromBinIPv4(167772160).should.equal('10.0.0.0');
        });
    });

    describe('#pushDataForIPv4', () => {

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
            var tree = dict.getBinTree4();

            // root node should have no child nodes.
            var node = tree[0];     // root node
            should.equal(node[I_IPV4_DATA], undefined);
            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(0);
            should.equal(node[I_IPV4_CHILD_ELEMENTS][I_CHILD_SUBNET_LENGTH], undefined);
            console.log(node);
            Object.keys(node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES]).length.should.equal(0);
        });

        it('should be able to push a root node 0.0.0.0/0', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-------------------------+
            */
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            var tree = dict.getBinTree4();

            var node = tree[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, undefined, []);
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
            dict.pushDataForIPv4("128.0.0.0", 1, "Data of 128.0.0.0/1");
            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 1, ['128.0.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('128.0.0.0')];
            assertTheNode(node, 'Data of 128.0.0.0/1', 1, false, undefined, []);
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
            dict.pushDataForIPv4("128.0.0.0", 1, "Data of 128.0.0.0/1");
            dict.pushDataForIPv4("0.0.0.0", 1, "Data of 0.0.0.0/1");
            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 1, ['128.0.0.0', '0.0.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('128.0.0.0')];
            assertTheNode(node1, 'Data of 128.0.0.0/1', 1, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('0.0.0.0')];
            assertTheNode(node1, 'Data of 0.0.0.0/1', 1, false, undefined, []);
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
            dict.pushDataForIPv4("255.255.255.255", 32, "Data of 255.255.255.255/32");
            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 32, ['255.255.255.255']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('255.255.255.255')];
            assertTheNode(node, 'Data of 255.255.255.255/32', 32, false, undefined, []);
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
            dict.pushDataForIPv4("255.255.255.255", 32, "Data of 255.255.255.255/32");
            dict.pushDataForIPv4("255.255.255.254", 32, "Data of 255.255.255.254/32");
            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 32, ['255.255.255.255', '255.255.255.254']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('255.255.255.255')];
            assertTheNode(node1, 'Data of 255.255.255.255/32', 32, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('255.255.255.254')];
            assertTheNode(node1, 'Data of 255.255.255.254/32', 32, false, undefined, []);
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var tree = dict.getBinTree4();

            var node = tree[0];
            assertTheNode(node, undefined, 0, true, 24, ['192.168.1.0']);

            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][-1062731520];    // -1062731520 -> 192.168.0.1
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.168.2.0", 24, "Data of 192.168.2.0/24");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 24, ['192.168.1.0', '192.168.2.0']);

            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, 'Data of 192.168.2.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");

            var node1 = dict.getBinTree4()[0];
            assertTheNode(node1, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/16', 16, false, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.168.2.0", 24, "Data of 192.168.2.0/24");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, false, 24, ['192.168.1.0', '192.168.2.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, 'Data of 192.168.2.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/16', 16, false, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, false, 24, ['192.168.1.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.168.2.0", 24, "Data of 192.168.2.0/24");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, false, 24, ['192.168.1.0', '192.168.2.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.2.0')];
            assertTheNode(node1, 'Data of 192.168.2.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/16', 16, false, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.pushDataForIPv4("192.0.0.0", 8, "Data of 192.0.0.0/8");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, "Data of 0.0.0.0/0", 0, false, 8, ['192.0.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node, "Data of 192.0.0.0/8", 8, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, "Data of 192.168.0.0/16", 16, false, 24, ['192.168.1.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, "Data of 192.168.1.0/24", 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.0.0.0", 8, "Data of 192.0.0.0/8");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, "Data of 0.0.0.0/0", 0, false, 8, ['192.0.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node, "Data of 192.0.0.0/8", 8, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, "Data of 192.168.0.0/16", 16, false, 24, ['192.168.1.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, "Data of 192.168.1.0/24", 24, false, undefined, []);
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 16, ['192.168.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, 'Data of 172.16.0.0/16', 16, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 16, true, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, 'Data of 192.168.1.0/24', 24, false, undefined, []);
        });

        function assertSetType3(dict) {
            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 16, ['192.168.0.0', '192.169.0.0', '172.16.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node1, undefined, 16, true, 24, ['192.169.1.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node1, "Data of 192.169.1.0/24", 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 16, true, 24, ['192.168.1.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node1, "Data of 192.168.1.0/24", 24, false, undefined, []);
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.169.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.169.1.0/24");
            assertSetType3(dict);
        });

        function assertSetType5(dict) {
            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, 8, ['192.0.0.0', '172.0.0.0', '10.0.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node1, undefined, 8, true, 16, ['192.168.0.0', '192.169.0.0']);
            var node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, undefined, 16, true, 24, ['192.168.1.0']);
            node2 = node2[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node2, "Data of 192.168.1.0/24", 24, false, undefined, []);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.169.0.0')];
            assertTheNode(node2, "Data of 192.169.0.0/16", 16, false, 24, ['192.169.1.0']);
            node2 = node2[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.169.1.0')];
            assertTheNode(node2, "Data of 192.168.1.0/24", 24, false, undefined, []);

            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node1, undefined, 8, true, 16, ['172.16.0.0']);
            node1 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node1, "Data of 172.16.0.0/16", 16, false, undefined, []);

            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('10.0.0.0')];
            assertTheNode(node1, "Data of 10.0.0.0/8", 8, false, undefined, []);
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.pushDataForIPv4("192.169.0.0", 16, "Data of 192.169.0.0/16");
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
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
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
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
                | 192.168.0.0/16(g)       | | 4)192.169.0.0/16(g)       | | 2)172.16.0.0/16(d)      |
                +-------------------------+ +-------------------------+ +-------------------------+
                  |                           |
                +-+-----------------------+ +-+-----------------------+
                | 5) 192.168.1.0/24(d)    | | 3) 192.169.1.0/24(d)    |
                +-------------------------+ +-------------------------+
            */
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
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
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.168.1.0/24");
            assertSetType5(dict);
        });
    });

    describe('#delete', () => {
        function createTree01() {
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
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.pushDataForIPv4("192.169.0.0", 16, "Data of 192.169.0.0/16");
            dict.pushDataForIPv4("192.169.1.0", 24, "Data of 192.168.1.0/24");
        }

        it('should delete a root data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+

                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(g)            |
                +-------------------------+
            */
            dict.pushDataForIPv4('0.0.0.0', 0, "Data of 0.0.0.0/0");
            dict.delete("0.0.0.0", 0).should.equal("Data of 0.0.0.0/0");;

            var node = dict.getBinTree4()[0];
            assertTheNode(node, undefined, 0, true, undefined, []);
        });

        it('should delete a single data node', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 10.0.0.0/8(d)           |
                +-------------------------+

                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-------------------------+
            */
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.delete("10.0.0.0", 8).should.equal("Data of 10.0.0.0/8");
            // var a = dict.delete("10.0.0.0", 8);
            // console.log("- " + a + " ----------------------------------------------------");

            var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, undefined, []);
        });

        it('should delete a sinble data node middle of data node', () => {
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
                                            +-+-----------------------+
                                            | 172.16.0.0/16(d)        |
                                            +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 172.0.0.0/8(g)          |
                +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.0.0/16(d)        |
                +-------------------------+
            */
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("10.0.0.0", 8, "Data of 10.0.0.0/8");
            dict.delete("10.0.0.0", 8).should.equal("Data of 10.0.0.0/8");;

           var node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 8, ['172.0.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.0.0.0')];
            assertTheNode(node, undefined, 8, true, 16, ['172.16.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('172.16.0.0')];
            assertTheNode(node, 'Data of 172.16.0.0/16', 16, false, undefined, []);
        });

        it('TODO', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 172.0.0.0/8(d)          |
                +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.0.0/16(d)        |
                +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 172.0.0.0/8(g)          |
                +-------------------------+
                  |
                +-+-----------------------+
                | 172.16.0.0/16(d)        |
                +-------------------------+
            */
        });

        it('TODO', () => {
            /*
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 172.0.0.0/8(d)          |
                +-------------------------+
                  | delete
                +-+-----------------------+
                | 172.16.0.0/16(d)        |
                +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 172.0.0.0/8(d)          |
                +-------------------------+
            */
        });

        it('TODO', () => {
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
                                            +-+-----------------------+
                                            | 172.16.0.0/16(d)        |
                                            +-------------------------+
                > below >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
                +-------------------------+
                | 0.0.0.0/0(d)            |
                +-+-----------------------+
                  |
                +-+-----------------------+
                | 10.0.0.0/8(d)           |
                +-+-----------------------+
            */
        });

    });

    describe('#find', () => {
        it('find', () => {
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
        });


        it('should return undefined if no data has been registered', () => {
            should.not.exist(dict.find("0.0.0.0"));
            should.not.exist(dict.find("192.168.1.10"));
            should.not.exist(dict.find("172.16.0.1"));
        });

        it('should return data if data has been registered in key 0.0.0.0/0', () => {
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
            dict.find("10.0.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("172.16.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("192.168.1.1").should.equal("Data of 0.0.0.0/0");
        });

        it('should return data for 0.0.0.0/0, 192.168.1.0/24', () => {
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
            dict.find("10.0.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("172.16.0.1").should.equal("Data of 0.0.0.0/0");
            dict.find("192.168.1.1").should.equal("Data of 192.168.1.0/24");
        });

        it('should return data for 0.0.0.0/0, 10.0.0.0/8, 172.16.0.0/16, 192.168.1.0/24', () => {
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("10.0.0.1", 8, "Data of 10.0.0.0/8");
            dict.pushDataForIPv4("172.16.0.1", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            dict.find("0.0.0.0").should.equal("Data of 0.0.0.0/0");
            dict.find("10.0.0.1").should.equal("Data of 10.0.0.0/8");
            dict.find("172.16.0.1").should.equal("Data of 172.16.0.0/16");
            dict.find("192.168.1.1").should.equal("Data of 192.168.1.0/24");
        });
        it('should return undefined(data of 0.0.0.0/0) if data which appropriate is not found', () => {
            dict.pushDataForIPv4("10.0.0.1", 8, "Data of 10.0.0.0/8");
            dict.pushDataForIPv4("172.16.0.1", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            should.not.exist(dict.find("0.0.0.0"));
            should.not.exist(dict.find("11.0.0.1"));
            should.not.exist(dict.find("172.17.0.1"));
            should.not.exist(dict.find("192.168.2.1"));
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 16);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, undefined, 16, true, 24, ['192.168.1.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 16);
            dict.createGlueNodes(node, 8);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 8, ['192.0.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.0.0.0')];
            assertTheNode(node, undefined, 8, true, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, undefined, 16, true, 24, ['192.168.1.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.1.0')];
            assertTheNode(node, 'Data of 192.168.1.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.0.0", 16, "Data of 192.168.0.0/16");
            dict.pushDataForIPv4("192.168.129.0", 24, "Data of 192.168.129.0/24");
            var node = dict.getBinTree4()[0];
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            dict.createGlueNodes(node, 17);

            node = dict.getBinTree4()[0];
            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, 'Data of 192.168.0.0/16', 16, false, 17, ['192.168.128.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node, undefined, 17, true, 24, ['192.168.129.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.129.0')];
            assertTheNode(node, 'Data of 192.168.129.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.pushDataForIPv4("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 16);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 16, ['192.168.0.0']);
            node = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node, undefined, 16, true, 24, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, 'Data of 192.168.128.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, 'Data of 192.168.0.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.pushDataForIPv4("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.128.0']);
            var node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.0.0']);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.172.0", 24, "Data of 192.168.172.0/24");
            dict.pushDataForIPv4("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.pushDataForIPv4("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.172.0', '192.168.128.0']);
            var node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.172.0')];
            assertTheNode(node2, 'Data of 192.168.172.0/24', 24, false, undefined, []);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.0.0']);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.pushDataForIPv4("192.168.64.0", 24, "Data of 192.168.64.0/24");
            dict.pushDataForIPv4("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.128.0']);
            var node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.0.0', '192.168.64.0']);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, false, undefined, []);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.64.0')];
            assertTheNode(node2, 'Data of 192.168.64.0/24', 24, false, undefined, []);
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
            dict.pushDataForIPv4("0.0.0.0", 0, "Data of 0.0.0.0/0");
            dict.pushDataForIPv4("192.168.172.0", 24, "Data of 192.168.172.0/24");
            dict.pushDataForIPv4("192.168.128.0", 24, "Data of 192.168.128.0/24");
            dict.pushDataForIPv4("192.168.64.0", 24, "Data of 192.168.64.0/24");
            dict.pushDataForIPv4("192.168.0.0", 24, "Data of 192.168.0.0/24");
            var node = dict.getBinTree4()[0];
            dict.createGlueNodes(node, 17);

            assertTheNode(node, 'Data of 0.0.0.0/0', 0, false, 17, ['192.168.128.0', '192.168.0.0']);
            var node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.172.0', '192.168.128.0']);
            var node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.172.0')];
            assertTheNode(node2, 'Data of 192.168.172.0/24', 24, false, undefined, []);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.128.0')];
            assertTheNode(node2, 'Data of 192.168.128.0/24', 24, false, undefined, []);
            node1 = node[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node1, undefined, 17, true, 24, ['192.168.0.0', '192.168.64.0']);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.0.0')];
            assertTheNode(node2, 'Data of 192.168.0.0/24', 24, false, undefined, []);
            node2 = node1[I_IPV4_CHILD_ELEMENTS][I_CHILD_NODES][dict.iPv4StringToBinary('192.168.64.0')];
            assertTheNode(node2, 'Data of 192.168.64.0/24', 24, false, undefined, []);
        });
    });

});


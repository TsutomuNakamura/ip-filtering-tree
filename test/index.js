var chai    = require('chai'),
    should  = chai.should();
const IPDict = require('../index').IPDict;

describe('ipdict', () => {
    var dict = undefined;

    const I_IPV4_DATA                       = 0;
    const I_IPV4_LENGTH_OF_SUBNETMASK       = 1;
    const I_IPV4_LENGTH_OF_CHILD_SUBNETMASK = 2;
    const I_IPV4_REF_CHILD_NODE             = 3;

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
            (() => { dict.iPv4StringToBinary('0.0.0.0.0'); }).should.throw(Error, '0.0.0.0.0 is not a valid IPv4 address format. It\'s format must be "n.n.n.n".');
            (() => { dict.iPv4StringToBinary('0.0.0'); }).should.throw(Error, '0.0.0 is not a valid IPv4 address format. It\'s format must be "n.n.n.n".');
            (() => { dict.iPv4StringToBinary('0.0.0.'); }).should.throw(Error);
        });
    });

    describe('#getBinIPv4NetAddr', function() {
        it('should get the network address from the binary IPv4 address', () => {
            dict.getBinIPv4NetAddr(-1, 32).should.equal(-1);
            dict.getBinIPv4NetAddr(-1, 24).should.equal(-256);
            dict.getBinIPv4NetAddr(-1, 16).should.equal(-65536);
            dict.getBinIPv4NetAddr(-1, 8).should.equal(-16777216);
            dict.getBinIPv4NetAddr(-1, 0).should.equal(0);

            dict.getBinIPv4NetAddr(-1, 31).should.equal(-2);
        });
    });

    describe('#createNewOneNode', function() {
        it('should create a new node with specified parameters', () => {
            var result = dict.createNewOneNode({a: 0}, -256, 24, {b: 1});

            result[I_IPV4_DATA].a.should.equal(0);
            result[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(-256);
            result[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK].should.equal(24);
            result[I_IPV4_REF_CHILD_NODE].b.should.equal(1);
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
            (d): node that has some data
        */
    
        /*  (Structure of tree)
            +-------------------------+
            | 0.0.0.0/0               |
            +-------------------------+
        */
//        it('should be empty node when no node has pushed', () => {
//            var tree = dict.getBinTree4();
//            
//            // root node should have no child nodes.
//            var node = tree[0];     // root node
//            should.equal(node[I_IPV4_DATA], undefined);
//            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(0);
//            should.equal(node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], undefined);
//            Object.keys(node[I_IPV4_REF_CHILD_NODE]).length.should.equal(0);
//        });
//
//        /*
//            +-------------------------+
//            | 0.0.0.0/0               |
//            +-+-----------------------+
//              |
//              +
//              |
//            +-+-----------------------+
//            | 192.168.1.0/24(d)       |
//            +-------------------------+
//        */
//        it('should be able to push a single node 192.168.1.0/24 to the tree', () => {
//            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");
//            var tree = dict.getBinTree4();
//
//            // Testing about root node
//            var node = tree[0];
//            should.equal(node[I_IPV4_DATA], undefined);
//            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(0);
//            node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK].should.equal(24);
//            Object.keys(node[I_IPV4_REF_CHILD_NODE]).length.should.equal(1);
//
//            // Testing about child node 192.168.1.0
//            node = node[I_IPV4_REF_CHILD_NODE][-1062731520];    // -1062731520 -> 192.168.0.1
//            node[I_IPV4_DATA].should.equal("Data of 192.168.1.0/24");
//            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(24);
//            should.equal(node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], undefined);
//            Object.keys(node[I_IPV4_REF_CHILD_NODE]).length.should.equal(0);
//        });

        it('should be able to push 2 node that has different subnet mask length order by 172.16.0.0/16 and 192.168.1.0/24', () => {
//            +-------------------------+
//            | 0.0.0.0/0               |
//            +-+-----------------------+
//              |
//              +-----------------------------+
//              |                             |
//            +-+-----------------------+   +-+-----------------------+
//            | 172.16.0.0/16           |   | 192.168.0.0/16          |
//            +-------------------------+   +-+-----------------------+
//                                            |
//                                            |
//                                            |
//                                          +-+-----------------------+
//                                          | 192.168.1.0/24          |
//                                          +-+-----------------------+
            dict.pushDataForIPv4("172.16.0.0", 16, "Data of 172.16.0.0/16");
            dict.pushDataForIPv4("192.168.1.0", 24, "Data of 192.168.1.0/24");

            var tree = dict.getBinTree4();
            var node = tree[0];     // root node
            should.equal(node[I_IPV4_DATA], undefined);
            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(0);
            node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK].should.equal(16);
            Object.keys(node[I_IPV4_REF_CHILD_NODE]).length.should.equal(2);

            // node 192.168.0.0/16 (glue node) (11000000.10101000.00000000.00000000)
            node = node[I_IPV4_REF_CHILD_NODE][-1062731776];    // 192.168.0.0/16
            should.equal(node[I_IPV4_DATA], undefined);
            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(16);

            // node 192.168.1.0/24 (real node) ()11000000.10101000.00000001.00000000
            node = node[I_IPV4_REF_CHILD_NODE][-1062731520];    // 192.168.1.0/24
            should.equal(node[I_IPV4_DATA], "Data of 192.168.1.0/24");
            node[I_IPV4_LENGTH_OF_SUBNETMASK].should.equal(24);
        });
    });
});


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
            //                    00000000 00000000 00000000 00000000 -> 0
            dict.iPv4StringToBinary('255.255.255.255').should.equal(-1);
            dict.iPv4StringToBinary('255.255.255.0').should.equal(-256);
            dict.iPv4StringToBinary('255.255.0.0').should.equal(-65536);
            dict.iPv4StringToBinary('255.0.0.0').should.equal(-16777216);
            // 192.168.1.0     -> 11000000 10101000 00000001 00000000 -> -1062731520
            //                    00111111 01010111 11111110 11111111 -> 1062731519
            dict.iPv4StringToBinary('192.168.1.0').should.equal(-1062731520);
            // 172.16.0.0      -> 10101100 00010000 00000000 00000000 -> -1408237568
            //                    01010011 11101111 11111111 11111111 -> 1408237567
            dict.iPv4StringToBinary('172.16.0.0').should.equal(-1408237568);
            // 10.0.0.0        -> 00001010 00000000 00000000 00000000 -> 167772160
            dict.iPv4StringToBinary('10.0.0.0').should.equal(167772160);
        });

        it('should throws exception when the invalid format of IPv4 was specified.', () => {
            // TODO: exception when invalid format was detected.
            
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
});


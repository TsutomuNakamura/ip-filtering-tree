var chai    = require('chai'),
    should  = chai.should();
const IpDict = require('../index').IpDict;

describe('ipdict', () => {
    var ipdict = new IpDict();
    describe('#ipv4StringToBinary', () => {
        // TODO:
        should.equal(ipdict.pushDataForIpv4('192.168.1.0', 24, {a: 0, b: 1}), undefined);

        ipdict.ipv4StringToBinary('0.0.0.0').should.equal(0);
        // 255.255.255.255 -> 11111111 11111111 11111111 11111111 -> -1
        //                    00000000 00000000 00000000 00000000 -> 0
        ipdict.ipv4StringToBinary('255.255.255.255').should.equal(-1);
        ipdict.ipv4StringToBinary('255.255.255.0').should.equal(-256);
        ipdict.ipv4StringToBinary('255.255.0.0').should.equal(-65536);
        ipdict.ipv4StringToBinary('255.0.0.0').should.equal(-16777216);
        // 192.168.1.0     -> 11000000 10101000 00000001 00000000 -> -1062731520
        //                    00111111 01010111 11111110 11111111 -> 1062731519
        ipdict.ipv4StringToBinary('192.168.1.0').should.equal(-1062731520);
        // 172.16.0.0      -> 10101100 00010000 00000000 00000000 -> -1408237568
        //                    01010011 11101111 11111111 11111111 -> 1408237567
        ipdict.ipv4StringToBinary('172.16.0.0').should.equal(-1408237568);
        // 10.0.0.0        -> 00001010 00000000 00000000 00000000 -> 167772160
        ipdict.ipv4StringToBinary('10.0.0.0').should.equal(167772160);

        // TODO: exception when invalid format was detected.
    });

    describe('#getRawIPv4NetAddr', function() {
        ipdict.getRawIPv4NetAddr(-1, 32).should.equal(-1);
        ipdict.getRawIPv4NetAddr(-1, 24).should.equal(-256);
        ipdict.getRawIPv4NetAddr(-1, 16).should.equal(-65536);
        ipdict.getRawIPv4NetAddr(-1, 8).should.equal(-16777216);
        ipdict.getRawIPv4NetAddr(-1, 0).should.equal(0);

        ipdict.getRawIPv4NetAddr(-1, 31).should.equal(-2);
    });
});


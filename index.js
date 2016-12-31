
exports.IpDict = function() {

    /** Instance of myself */
    const myself = this;

    /** 0 of 32bit unsigned integer */
    const INT32_0 = ~~0;

    /** IPv4 subnet masks */
    const ipv4NetMasks = (function () {
        var masks   = new Array(32 + 1);
        var mask    = ~~0xffffffff;
        var bit     = 0;

        for(var i = 32; i >= 0; --i) {
            masks[i] = mask;
            mask <<= 1;
        }
        return masks;
    })();

    var ipv4Dict = {};
    ipv4Dict[0] = [
        undefined,          /* data */
        0,                  /* length of subnetmask */
        undefined,          /* length of child node's subnet mask */
        {}                  /* next node */
    ];

    /** Index of data on ipv4 dictionary  */
    const I_IPV4_DATA = 0;
    /** Index of length of subnetmask on ipv4 dictionary */
    const I_IPV4_LENGTH_OF_SUBNETMASK = 1;
    /** Index of length of child subnetmask on ipv4 dictionary */
    const I_IPV4_LENGTH_OF_CHILD_SUBNETMASK = 2;

    /**
     * Push a data in database indexed by IPv4 network address.
     * @param {string} ipv4  IPv4 address string for index
     * @param {number} len   Length of network address for IPv4 address
     * @param {object} data  Data for push
     */
    this.pushDataForIpv4 = function(ipv4, len, data) {
        pushDataToIpv4Tree(ipv4Dict[0], ipv4StringToBinary(ipv4), );
    }

    this.pushDataToIpv4Tree = function(oneNode, rawIpv4, subnetLen, data) {
        var currentNodesSubnetLen = oneNode[I_IPV4_LENGTH_OF_SUBNETMASK];
    }

    /**
     * Convert the IPv4 string to an unsignet 32bit integer.
     * @param {string} ipv4
     */
    this.ipv4StringToBinary = function(ipv4) {
        var rawIpv4     = 0;
        var arrIpv4     = ipv4.split('.');
        var tmpOctet    = 0;

        if(arrIpv4.length != 4) {
            // TODO: Change error more adequate
            throw new Error(ipv4 + " is not a valid IPv4 address format. It's format must be \"n.n.n.n\".");
        }

        for(var i = 0; i < arrIpv4.length; ++i) {
            rawIpv4 <<= 8;
            tmpOctet = parseInt(arrIpv4[i]);
            if(tmpOctet > 255 || tmpOctet < 0) {
                // TODO: Change error more adequate
                throw new Error(
                    "Each octet must be greater or equal to 0 and less or equal 255(" + ipv4 + ").");
            }
            rawIpv4 += parseInt(arrIpv4[i]);
        }

        return rawIpv4;
    }

    /**
     * Get network address from raw IPv4 address and length of subnetmask.
     * @param {number} rawIpv4    Raw IPv4 address(not string IPv4 format)
     * @param {number} subnetLen  Length of subnetmask
     */
    this.getRawIPv4NetAddr = function(rawIpv4, subnetLen) {
        return (ipv4NetMasks[subnetLen] & rawIpv4);
    }

}


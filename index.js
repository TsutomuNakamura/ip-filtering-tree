
exports.IPDict = function() {

    /** Instance of myself */
    const myself = this;

    /** 0 of 32bit unsigned integer */
    const INT32_0 = ~~0;

    /** IPv4 subnet masks */
    const iPv4NetMasks = (function () {
        var masks   = new Array(32 + 1);
        var mask    = ~~0xffffffff;
        var bit     = 0;

        for(var i = 32; i >= 0; --i) {
            masks[i] = mask;
            mask <<= 1;
        }
        return masks;
    })();

    var iPv4Dict = {};
    iPv4Dict[0] = [         /* Network address */
        undefined,          /* Data */
        0,                  /* Length of subnetmask */
        undefined,          /* Length of child node's subnet mask */
        {}                  /* Next node */
    ];

    /** Index of data on IPv4 dictionary  */
    const I_IPV4_DATA                       = 0;
    /** Index of length of subnetmask on IPv4 dictionary */
    const I_IPV4_LENGTH_OF_SUBNETMASK       = 1;
    /** Index of length of child subnetmask on IPv4 dictionary */
    const I_IPV4_LENGTH_OF_CHILD_SUBNETMASK = 2;
    /** Index of reference of child node */
    const I_IPV4_REF_CHILD_NODE             = 3;

    /**
     * Push a data in database indexed by IPv4 network address.
     * @param {string} IPv4  IPv4 address string for index
     * @param {number} len   Length of network address for IPv4 address
     * @param {object} data  Data for push
     */
    this.pushDataForIPv4 = function(iPv4, len, data) {
        myself.pushDataToIPv4Tree(iPv4Dict[0], myself.iPv4StringToBinary(iPv4), len, data);
    }

    /**
     * Push data into IPv4 indexed tree.
     * @param {object} node Current node of IPv4 indexed tree.
     * @param {number} binIPv4 Binary IPv4 network address not as string.
     */
    this.pushDataToIPv4Tree = function(node, binIPv4, subnetLen, data) {
        var subnetLenOfCurrentNode = node[I_IPV4_LENGTH_OF_SUBNETMASK];
        if(subnetLenOfCurrentNode === subnetLen) {
            // The data has already existed in thre tree
            if(node[I_IPV4_DATA] !== subnetLen) {
                throw new Error("Aboart pushing due to the data has already existed.");
            }

            // Override the data in this glue node.
            node[I_IPV4_DATA] = data;

            /* return */
        } else {
            if(Object.keys(node[I_IPV4_REF_CHILD_NODE]).length === 0) {
                // console.log("DEBUG: in \"if(Object.keys(node[I_IPV4_REF_CHILD_NODE]).length === 0)\" ... "
                //         + "IPv4: " + myself.stringifyFromBinIPv4(binIPv4)
                //         + ", Subnet len: " + subnetLen);      // TODO: debug
                //
                // Append the data into this node if this node didn't have any child nodes.
                var netAddr4 = myself.getBinIPv4NetAddr(binIPv4, subnetLen);
                node[I_IPV4_REF_CHILD_NODE][netAddr4]   = myself.createNewOneNode(data, subnetLen, undefined, {});
                node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] = subnetLen;
            } else {
                // Append the data after some instruction is done.
                var childSubnetLen = node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK];
                if(childSubnetLen === subnetLen) {

                    // console.log("DEBUG: in \"if(childSubnetLen === subnetLen)\" ... "
                    //         + "IPv4: " + myself.stringifyFromBinIPv4(binIPv4)
                    //         + ", Subnet len: " + subnetLen);      // TODO: debug

                    /*
                     * push case 1)
                     * If subnet mask length of child node and subnet mask length of node that will be pushed are same,
                     * and if network address of child node and network address that will be pushed are same,
                     * and if data of child node was not set,
                     * then set the data as child node.
                     *
                     * push case 2)
                     * If subnet msak length of child node and subnet mask length of node that will be pushed are same,
                     * and there isn't child node as same network address,
                     * then push the new node.
                     */
                    var netAddr4 = getBinaIPv4NetAddr(binIPv4, subnetLen);

                    if(netAddr4 in node[I_IPV4_REF_CHILD_NODE]) {
                        if(node[I_IPV4_REF_CHILD_NODE][netAddr4][I_IPV4_DATA]) {
                            // The data is already existed in same indexed node.
                            // TODO: show IPv4 string and subnet
                            throw new Error("The data is already existed in tree with index ...");
                        } else {
                            // Update the already existed empty node.
                            node[I_IPV4_REF_CHILD_NODE][netAddr4][I_IPV4_DATA] = data;
                            /* return */
                        }

                    } else {
                        // 
                        node[I_IPV4_REF_CHILD_NODE][netAddr4]
                                = createNewOneNode(data, subnetLen, undefined, {});
                        /* return */
                    }
                } else if (childSubnetLen > subnetLen) {
                    //console.log("DEBUG: in \"if (childSubnetLen > subnetLen)\" ... "
                    //        + "IPv4: " + myself.stringifyFromBinIPv4(binIPv4)
                    //        + ", Subnet len: " + subnetLen);      // TODO: debug

                    // If subnet length of node will be pushd longer than current child node,
                    // then create a glue node with subnet length of node will be pushed.

                    var newNode = {};
                    for(var n4 in node[I_IPV4_REF_CHILD_NODE]) {
                        // Archive child nodes
                        var childNode = oneNode[I_IPV4_REF_CHILD_NODE][n4];
                        newNode[n4] = childNode;
                        delete node[I_IPV4_REF_CHILD_NODE][n4];
                    }

                    // Recalculate glue node's network address
                    for(var oldN4 in newNode) {
                        var newN4 = getBinIPv4NetAddr(binIPv4, subnetLen);
                        node[I_IPV4_REF_CHILD_NODE][newN4]
                                = createNewOneNode(undefined, subnetLen, newNode[oldN4][I_IPV4_LENGTH_OF_SUBNETMASK], newNode);
                        break;
                    }

                    // Update original child subnet mask length
                    node[I_IPV4_REV_CHILD_NODE] = subnetLen;

                    // Create new node at child node after created the glue node.
                    var insertNet4 = getBinIPv4NetAddr(binIPv4, subnetLen);
                    if(insertNet4 in node[I_IPV4_REF_CHILD_NODE]) {
                        myself.pushDataToIPv4Tree(
                            node[I_IPV4_REF_CHILD_NODE][insertNet4], binIPv4, subnetLen, data);
                        /* return */
                    } else {
                        node[I_IPV4_REF_CHILD_NODE][insertNet4]
                                = createNewOneNode(data, subnetLen, undefined, {});
                    }
                } else {    /* childSubnetLen < subnetLen */
                    // TODO:
                    // console.log("DEBUG: in \"if (childSubnetLen < subnetLen)\" ... "
                    //         + "IPv4: " + myself.stringifyFromBinIPv4(binIPv4)
                    //         + ", Subnet len: " + subnetLen
                    //         + ", Child subnet len: " + childSubnetLen);      // TODO: debug
                    /*
                     * Subnet mask length of node that will be pushed is longer than subnet mask length of child node,
                     * then recalculate subnet mask length with length of child node.
                     * As a result, if the result of re-calculate network address is equals to child node,
                     * then the child node become a glue node of the node that will be pushed.
                     * Else if a new empty node created as new become a glue node.
                     */
                    var netAddr4 = myself.getBinIPv4NetAddr(binIPv4, node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);
                    if(netAddr4 in node[I_IPV4_REF_CHILD_NODE]) {
                        // console.log("DEBUG: \"if(netAddr4 in node[I_IPV4_REF_CHILD_NODE])\"");    // TODO: debug
                        pushDataToIPv4Tree(node[I_IPV4_REF_CHILD_NODE][netAddr4], binIPv4, subnetLen, data);
                        /* return */
                    } else {
                        // console.log("DEBUG: \"if(netAddr4 NOT in node[I_IPV4_REF_CHILD_NODE])\"");    // TODO: debug
                        var newNet4 = myself.getBinIPv4NetAddr(binIPv4, subnetLen);
                        var glueNode
                                = node[I_IPV4_REF_CHILD_NODE][netAddr4]
                                = myself.createNewOneNode(undefined, node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], subnetLen, {});
                        glueNode[I_IPV4_REF_CHILD_NODE][newNet4]
                                = myself.createNewOneNode(data, subnetLen, undefined, {});
                       /* return */
                    }
                }
            }  // End of "Object.keys(node[I_IPV4_LENGTH_OF_SUBNETMASK]).length === 0"
        }  // End of "subnetLenOfCurrentNode === subnetLen"
    }

    /**
     * Convert the IPv4 string to an unsignet 32bit integer.
     * @param {string} IPv4
     */
    this.iPv4StringToBinary = function(iPv4) {
        var binIPv4     = 0;
        var arrIPv4     = iPv4.split('.');
        var tmpOctet    = 0;

        if(arrIPv4.length != 4) {
            // TODO: Change error more adequate
            throw new Error(iPv4 + " is not a valid IPv4 address format. It's format must be \"n.n.n.n\".");
        }

        for(var i = 0; i < arrIPv4.length; ++i) {
            binIPv4 <<= 8;
            tmpOctet = parseInt(arrIPv4[i]);
            if(tmpOctet > 255 || tmpOctet < 0) {
                // TODO: Change error more adequate
                throw new Error(
                    "Each octet must be greater or equal to 0 and less or equal 255(" + iPv4 + ").");
            }
            binIPv4 += parseInt(arrIPv4[i]);
        }


        return binIPv4;
    }

    /**
     * Get network address from binary IPv4 address and length of subnetmask.
     * @param {number} binIPv4    binary IPv4 address(not string IPv4 format)
     * @param {number} subnetLen  Length of subnetmask
     */
    this.getBinIPv4NetAddr = function(binIPv4, subnetLen) {
        return (iPv4NetMasks[subnetLen] & binIPv4);
    }

    /**
     * Create a new node.
     * @param {object} data            Data for node.
     * @param {number} subnetLen       Length of subnet mask length of current node.
     * @param {number} childSubnetLen  Length of subnet mask length of child node.
     */
    this.createNewOneNode = function(data, subnetLen, childSubnetLen, refToChild) {
        var result = new Array(4);

        result[I_IPV4_DATA]                         = data;
        result[I_IPV4_LENGTH_OF_SUBNETMASK]         = subnetLen;
        result[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]   = childSubnetLen;
        result[I_IPV4_REF_CHILD_NODE]               = refToChild;

        return result;
    }

    /**
     * Return binary IPv4 dict
     */
    this.getBinTree4 = function() {
        return iPv4Dict;
    }

    /**
     * Stringify binary IPv4 address.
     * @param {number} binIPv4 Binary IPv4 address.
     */
    this.stringifyFromBinIPv4 = function(binIPv4) {
        var copyBinIPv4 = binIPv4;
        var mask256     = ~~255;
        var result      = '';
        for(var i = 0; i < 4; ++i) {
            result = (copyBinIPv4 & mask256) + result;
            if (i < 3) {
                result = '.' + result
                copyBinIPv4 >>>= 8;
            }
        }

        return result;
    }

}


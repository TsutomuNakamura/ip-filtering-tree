
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

    /** Index of data on IPv4 dictionary  */
    const I_IPV4_DATA                       = 0;
    /** Index of length of subnetmask on IPv4 dictionary */
    const I_IPV4_LENGTH_OF_SUBNETMASK       = 1;
    /** Index of is glue node */
    const I_IPV4_IS_GLUE_NODE               = 2;
    /** Index of length of child subnetmask on IPv4 dictionary */
    const I_IPV4_LENGTH_OF_CHILD_SUBNETMASK = 3;
    /** Index of reference of child node */
    const I_IPV4_REF_CHILD_NODE             = 4;
//    /** Index of reference of child node */
//    const I_IPV4_CHILD_ELEMENTS             = 3;
//
//    /** Index of subnet mask length in child node */
//    const I_CHILD_SUBNET_LENGTH             = 0;
//    /** Index of child nodes */
//    const I_CHILD_NODES                     = 1;

    //var iPv4Dict = {};
    var iPv4Dict = [  /* node to store root node */
        undefined,
        undefined,
        undefined,
        undefined,
        {}
    ];
    iPv4Dict[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] = 0;
    iPv4Dict[I_IPV4_REF_CHILD_NODE][0] = [         /* Network address */
        undefined,          /* Data */
        0,                  /* Length of subnetmask */
        true,               /* Is glue node? */
        undefined,          /* Length of child subnetmask */
        {}                  /* child nodes map */
    ];

    /**
     * Remove a data in database indexed by IPv4 network address.
     * @param {string} IPv4  address string for index
     * @param {number} len   Length of network address for IPv4 address
     */
    this.delete = function(iPv4, len) {
        // TODO:
        return myself.deleteDataToIPv4Tree(iPv4Dict[I_IPV4_REF_CHILD_NODE][0], undefined, myself.iPv4StringToBinary(iPv4), len);
    }

    this.deleteDataToIPv4Tree = function(node, pNode, ip, length) {
        var currentNode                 = node;
        var parentNode                  = pNode;
        var subnetLengthOfCurrentNode   = currentNode[I_IPV4_LENGTH_OF_SUBNETMASK];
        var result                      = node[I_IPV4_DATA];
        var netAddr                     = undefined;
        var stack                       = new Array(0);

        while(true) {
            if(currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] === length) {
                if(currentNode[I_IPV4_IS_GLUE_NODE]) {
                    console.log("= DEBUG: delete section 0 ============================================");
                    // FIXME: Does this section should throw error?
                    return undefined;
                } else {
                    console.log("= DEBUG: delete section 1 ============================================");
                    // remove and return the data
                    result = currentNode[I_IPV4_DATA];

                    // FIXME: If root node will be targetted, parentnode will be undefined
                    if(currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] === 0) {
                        console.log("= DEBUG: delete section 7 ============================================");
                        iPv4Dict[I_IPV4_REF_CHILD_NODE][0] = myself.createNewOneNode(
                                            undefined,
                                            currentNode[I_IPV4_LENGTH_OF_SUBNETMASK],
                                            true,
                                            currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK],
                                            currentNode[I_IPV4_REF_CHILD_NODE]);
                    } else if(Object.keys(parentNode[I_IPV4_REF_CHILD_NODE]).length === 1) {
                        console.log("= DEBUG: delete section 6 ============================================");

                        // FIXME: need to recreate the node of parent of parent
                        // parentNode[I_IPV4_REF_CHILD_NODE] = myself.createNewChildElement(
                        //                                         currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK],
                        //                                         currentNode[I_IPV4_REF_CHILD_NODE]);
                        // TODO: delete current node?
                    } else {

                        // Does current node have child nodes?
                        if(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] !== undefined) {
                            // Delete as glue node
                            console.log("= DEBUG: delete section 2 ============================================");
                            var newNode = myself.createNewOneNode(
                                                undefined,
                                                currentNode[I_IPV4_LENGTH_OF_SUBNETMASK],
                                                true,
                                                currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK],
                                                currentNode[I_IPV4_REF_CHILD_NODE]);
                            parentNode[I_IPV4_REF_CHILD_NODE][netAddr] = newNode;
                        } else {
                            console.log("= DEBUG: delete section 2-2 ============================================");
                            delete parentNode[I_IPV4_REF_CHILD_NODE][netAddr];
                        }

                    }
                    return result;
                }
            } else if(currentNode[I_IPV4_LENGTH_OF_SUBNETMASK] > length) {
                console.log("= DEBUG: dleete section 3 ============================================");
                // newver existed
                return undefined;
            }

            // has child?
            if(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]) {
                console.log("= DEBUG: delete section 4 ============================================");
                netAddr = myself.getBinIPv4NetAddr(ip, currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);
                if(currentNode[I_IPV4_REF_CHILD_NODE][netAddr]) {
                    console.log("= section 5 ============================================");
                    parentNode = currentNode;
                    currentNode = parentNode[I_IPV4_REF_CHILD_NODE][netAddr];
                    // continue;
                }
                myself.dumpTree(myself.getRootNode());
            } else {
                return undefined;
            }
        }
    }

    this.find = function(keyIP) {
        var ip              = myself.iPv4StringToBinary(keyIP, 32);
        var netAddr         = undefined;    /* should 0.0.0.0 at first time */
        var currentNode     = iPv4Dict[I_IPV4_REF_CHILD_NODE][0];
        var nextNode        = undefined;
        var result          = currentNode[I_IPV4_DATA];

        while(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] !== undefined) {
            netAddr = myself.getBinIPv4NetAddr(ip, currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);
            if(nextNode = currentNode[I_IPV4_REF_CHILD_NODE][netAddr]) {
                // found data node or glue node
                if(!nextNode[I_IPV4_IS_GLUE_NODE]) {
                    result = nextNode[I_IPV4_DATA];
                }
                currentNode = nextNode;
            } else {
                return result;
            }
        }
        return result;
    }

    /**
     * Push a data in database indexed by IPv4 network address.
     * @param {string} IPv4  IPv4 address string for index
     * @param {number} len   Length of network address for IPv4 address
     * @param {object} data  Data for push
     */
    this.pushDataForIPv4 = function(iPv4, len, data) {
        myself.pushDataToIPv4Tree(iPv4Dict[I_IPV4_REF_CHILD_NODE][0], iPv4Dict, myself.iPv4StringToBinary(iPv4), len, data);
    }

    /**
     * Push data into IPv4 indexed tree.
     * @param {object} node Current node of IPv4 indexed tree.
     * @param {number} binIPv4 Binary IPv4 network address not as string.
     */
    this.pushDataToIPv4Tree = function(node, pNode, binaryIPv4, subnetLength, data) {

        var currentNode         = node;
        var parentNode          = pNode;
        var lastNetworkAddress  = 0;

        console.log("Pusing -> IP: " + myself.stringifyFromBinIPv4(binaryIPv4) + ", subnetLength: " + subnetLength + ", data: " + data);

        while(true) {
            var subnetLengthOfCurrentNode   = currentNode[I_IPV4_LENGTH_OF_SUBNETMASK];
            var networkAddress              = myself.getBinIPv4NetAddr(binaryIPv4, subnetLength);

            if(subnetLengthOfCurrentNode === subnetLength) {
                console.log("# DEBUG: # push section 1 ############################################");  /* DEBUG: */

                // The data may have been existed
                if(currentNode[I_IPV4_DATA] !== undefined) {
                    // The data have been existed!
                    throw new Error("Aboart pushing due to the data has already existed.");
                }

                // FIXME: to atomic
                // Override the data in this glue node.

                parentNode[I_IPV4_REF_CHILD_NODE][networkAddress] = myself.createNewOneNode(
                                                                            data,
                                                                            subnetLengthOfCurrentNode,
                                                                            false,
                                                                            currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK],
                                                                            currentNode[I_IPV4_REF_CHILD_NODE]);
                break;
            } else if(subnetLengthOfCurrentNode < subnetLength) {

                // var networkAddress = myself.getBinIPv4NetAddr(binaryIPv4, subnetLength);

                if(Object.keys(currentNode[I_IPV4_REF_CHILD_NODE]).length === 0) {

                    console.log("# DEBUG: # push section 2 ############################################");  /* DEBUG: */

                    // FIXME: createNewChildElement()
                    var newNode = myself.createNewOneNode(
                                            currentNode[I_IPV4_DATA],
                                            currentNode[I_IPV4_LENGTH_OF_SUBNETMASK],
                                            currentNode[I_IPV4_IS_GLUE_NODE],
                                            subnetLength,
                                            currentNode[I_IPV4_REF_CHILD_NODE]);

                    newNode[I_IPV4_REF_CHILD_NODE][networkAddress] = myself.createNewOneNode(data, subnetLength, false, undefined, {});
                    console.log("current NetworkAddress -> " + myself.stringifyFromBinIPv4(networkAddress));
                    console.log("lastNetworkAddress -> " + myself.stringifyFromBinIPv4(lastNetworkAddress));
                    parentNode[I_IPV4_REF_CHILD_NODE][lastNetworkAddress] = newNode;  /* FIXME: おかしい */
                    //currentNode[I_IPV4_REF_CHILD_NODE][networkAddress] = newNode;  /* FIXME: おかしい */
                    myself.dumpTree(myself.getRootNode());
                    //console.log(myself.getRootNode());

                    // TODO:
                    // currentNode[I_IPV4_REF_CHILD_NODE][networkAddress]  = myself.createNewOneNode(data, subnetLength, false, undefined, {});
                    // currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]      = subnetLength;

                    break;
                }

                if(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] > subnetLength) {

                    console.log("# DEBUG: # push section 3 ############################################");  /* DEBUG: */
                    // insert and create glue node for existing node as needed
                    // #########################################################
                    // Create glue node then check the glue node's network address.
                    //   If match: continue
                    //   If not match: insert the node then break

                    myself.createGlueNodes(currentNode, subnetLength);

                    if(!(networkAddress in currentNode[I_IPV4_REF_CHILD_NODE])) {
                        currentNode[I_IPV4_REF_CHILD_NODE][networkAddress] = myself.createNewOneNode(data, subnetLength, false, undefined, {});

                        break;
                    }

                    // TODO: debug
                    //myself.dumpTree(currentNode);
                    // TODO: ここは到達不能では?

                    // TODO: continue
                } else if(currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK] < subnetLength) {
                    console.log("# DEBUG: # push section 4 ############################################");  /* DEBUG: */

                    // continue then new node will be appended
                    var childNetworkAddress = myself.getBinIPv4NetAddr(binaryIPv4, currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]);

                    if(currentNode[I_IPV4_REF_CHILD_NODE][childNetworkAddress] === undefined) {
                        currentNode[I_IPV4_REF_CHILD_NODE][childNetworkAddress]
                                = myself.createNewOneNode(undefined, currentNode[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], true, undefined, {});
                    }
                    // TODO: debug
                    //myself.dumpTree(currentNode);  // FIXME: ???
                    parentNode  = currentNode;
                    currentNode = currentNode[I_IPV4_REF_CHILD_NODE][childNetworkAddress];
                    //lastNetworkAddress = networkAddress;
                    lastNetworkAddress = myself.getBinIPv4NetAddr(binaryIPv4, currentNode[I_IPV4_LENGTH_OF_SUBNETMASK]);
                    myself.dumpTree(myself.getRootNode());  /* TODO: debug */

                    // TODO: continue
                } else {
                    console.log("# DEBUG: # push section 5 ############################################");  /* DEBUG: */
                    if(!currentNode[I_IPV4_REF_CHILD_NODE][binaryIPv4]) {
                        currentNode[I_IPV4_REF_CHILD_NODE][binaryIPv4]
                                = myself.createNewOneNode(undefined, subnetLength, true, undefined, {});
                    }
                    parentNode  = currentNode;
                    currentNode = currentNode[I_IPV4_REF_CHILD_NODE][binaryIPv4];    /* continue */
                }
            } else {
                // no way

                console.log("Never reachable.");

                return;  // TODO:
            }
        }

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
            if(isNaN(tmpOctet) || tmpOctet > 255 || tmpOctet < 0) {
                // TODO: Change error more adequate
                throw new Error(
                    "Each octet must be greater or equal to 0 and less or equal 255 or is not NaN(" + iPv4 + ").");
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
    this.createNewOneNode = function(data, subnetLen, isGlueNode, childSubnetLen, refToChild) {
        var result = new Array(5);

        result[I_IPV4_DATA]                         = data;
        result[I_IPV4_LENGTH_OF_SUBNETMASK]         = subnetLen;
        result[I_IPV4_IS_GLUE_NODE]                 = isGlueNode;
        result[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]   = childSubnetLen;
        result[I_IPV4_REF_CHILD_NODE]               = refToChild;

        return result;
    }

    /**
     * Return binary IPv4 dict
     */
    this.getRootNode= function() {
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
        // console.log(iPv4Dict[I_IPV4_REF_CHILD_NODE]);
        return iPv4Dict[I_IPV4_REF_CHILD_NODE][0];
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

    this.createGlueNodes = function (node, subnetLength){
        var childNodes = node[I_IPV4_REF_CHILD_NODE];
        var rootOfGlueNodes = {};

        for(key in childNodes) {
            var netAddress = myself.getBinIPv4NetAddr(key, subnetLength);

            if(!(netAddress in rootOfGlueNodes)) {
                rootOfGlueNodes[netAddress]
                        = myself.createNewOneNode(undefined, subnetLength, true, node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK], {});
            }
            var glueNode = rootOfGlueNodes[netAddress];
            glueNode[I_IPV4_REF_CHILD_NODE][key] = childNodes[key];
        }

        // FIXME: should be atomicity
        node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]  = subnetLength;
        node[I_IPV4_REF_CHILD_NODE]          = rootOfGlueNodes;
    }

    this.dumpTree = function(node, maxdepth = -1) {
        console.log(">> dump tree from here >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        myself._dumpTree(node, maxdepth);
        console.log("<< dump tree to here   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }
    this._dumpTree = function(node, maxdepth, indent_count = 0, depth = 0) {
        var childKeyList = "";
        var keyOfChildren = Object.keys(node[I_IPV4_REF_CHILD_NODE]);

        for(var i = 0; i < keyOfChildren.length; i++) {
            if(i !== 0) childKeyList += ",";
            childKeyList += myself.stringifyFromBinIPv4(keyOfChildren[i]);
        }

        console.log(" ".repeat(indent_count * 2)
                + "data: " + node[I_IPV4_DATA]
                + ", len: " + node[I_IPV4_LENGTH_OF_SUBNETMASK]
                + ", glue: " + node[I_IPV4_IS_GLUE_NODE]
                + ", c_len: " + node[I_IPV4_LENGTH_OF_CHILD_SUBNETMASK]
                + ", c_key: " + childKeyList);
        if(depth === maxdepth) return;

        for(var k in node[I_IPV4_REF_CHILD_NODE]) {
            myself._dumpTree(node[I_IPV4_REF_CHILD_NODE][k], maxdepth, indent_count + 1, depth + 1);
        }
    }
}


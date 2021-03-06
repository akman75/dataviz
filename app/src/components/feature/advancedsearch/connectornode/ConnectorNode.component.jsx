import { Box, Heading, Select, VStack } from '@chakra-ui/react';
import React from 'react';
import { Handle } from 'react-flow-renderer';

const connectorNode = ({ data, isConnectable }) => {
    const modifyConnector = value => {
        data.connector = value.target.value;
    };

    return (
        <>
            <Box
                backgroundColor="blackAlpha.300"
                borderRadius="8px"
                padding="8px"
            >
                <Handle
                    type="target"
                    position="top"
                    style={{
                        bottom: 30,
                        background: '#555',
                        borderRadius: '5px',
                        height: '10px',
                        width: '20px'
                    }}
                    isConnectable={isConnectable}
                />
                <VStack alignItems="start" fontSize="14px">
                    <Heading size="xs">Connector</Heading>
                    <Select
                        margin="0px"
                        variant="filled"
                        size="sm"
                        defaultValue={data.connector}
                        borderRadius="5px"
                        onChange={modifyConnector}
                    >
                        <option value="and">and</option>
                        <option value="or">or</option>
                        <option value="not">not</option>
                    </Select>
                </VStack>
                <Handle
                    type="source"
                    position="bottom"
                    style={{
                        bottom: 0,
                        background: '#555',
                        marginBottom: '-5px',
                        borderRadius: '5px',
                        height: '10px',
                        width: '20px'
                    }}
                    isConnectable={isConnectable}
                />
            </Box>
        </>
    );
};

export default connectorNode;

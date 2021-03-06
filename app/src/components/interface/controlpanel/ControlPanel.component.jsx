import {
    Box,
    Divider,
    Flex,
    HStack,
    IconButton,
    Slide,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import SettingsComponent from 'components/feature/settings/Settings.component';
import {
    ChevronDoubleLeft,
    ChevronDoubleRight,
    DisplayFullwidth,
    Eye,
    FormatSeparator,
    LayoutPin,
    LivePhoto,
    MediaLive,
    PathDivide,
    PathIntersect,
    RadioChecked
} from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function ControlPanel() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onToggle } = useDisclosure();
    const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
    const tabListbgColor = useColorModeValue('white', 'black');
    const tabInactiveColors = useColorModeValue('black', 'white');
    const tabBorderColor = useColorModeValue('white', 'black');
    const edgeColor = useColorModeValue('gray.300', 'gray.900');
    const [originNodeExists, setOriginNodeExists] = useState(false);

    const selfCentricMenuBackground = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    const legendBackgroundColor = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    const legendBorderColor = useColorModeValue('gray.100', 'gray.900');

    const toggleControlPanel = () => {
        onToggle();

        store.track.trackEvent(
            'controls panel',
            'button click',
            `${isOpen ? 'open' : 'close'} controls panel`
        );
    };

    const openSliderIfClosed = () => {
        if (!isOpen) {
            onOpen();
        }
    };

    const renderColorLegend = () => {
        const selectedColorScheme =
            store.graphInstance.nodeColorScheme[store.core.currentGraph];

        let legendItems = Object.keys(
            store.graphInstance.nodeColorSchemeColors[store.core.currentGraph][
                selectedColorScheme
            ]
        );

        if (selectedColorScheme === 'type') {
            legendItems = legendItems.filter(key =>
                store.graph.detailGraphData.perspectivesInGraph.includes(key)
            );
        }

        const legend = legendItems.map(key => {
            return (
                <HStack width="100%" key={key}>
                    <Tag
                        size="sm"
                        borderRadius="full"
                        variant="solid"
                        backgroundColor={
                            store.graphInstance.nodeColorSchemeColors[
                                store.core.currentGraph
                            ][selectedColorScheme][key]
                        }
                    />
                    <Text
                        size="sm"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {key}
                    </Text>
                </HStack>
            );
        });

        if (legend.length === 0) {
            return null;
        }

        return (
            <Flex
                id="colorscheme"
                position="absolute"
                bottom="20px"
                left="320px"
                maxWidth="200px"
                zIndex={20}
                backgroundColor={legendBackgroundColor}
                padding="10px"
                borderRadius="10px"
                style={{ backdropFilter: 'blur(2px)' }}
                border="1px solid"
                borderColor={legendBorderColor}
                maxHeight="300px"
                overflowY="scroll"
            >
                <VStack width="100%" paddingBottom="10px">
                    {legend}
                </VStack>
            </Flex>
        );
    };

    useEffect(() => {
        setOriginNodeExists(
            store.graph.currentGraphData.selectedNodes.length < 2 ||
                !store.graphInstance.selfCentricOriginNode
        );
    }, [
        store.graph.currentGraphData.selectedNodes.length,
        store.graph.currentGraphData.selectedNodes,
        store.graphInstance.selfCentricOriginNode
    ]);

    useEffect(() => {
        onOpen();
    }, [onOpen]);

    const renderDirectConnectionsMenu = () => (
        <HStack
            id="directconnectionsmenu"
            position="absolute"
            top="20px"
            left="320px"
            zIndex={20}
            spacing="2"
            backgroundColor={selfCentricMenuBackground}
            padding="5px 6px"
            borderRadius="8px"
            style={{ backdropFilter: 'blur(2px)' }}
        >
            <HStack spacing="1">
                <Tooltip label="Show all nodes">
                    <IconButton
                        borderRadius="6px"
                        id="closedirectconnections"
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<MediaLive style={{ '--ggs': '0.6' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'hide direct connections'
                            );
                            store.graphInstance.toggleVisibleComponents(-1);
                            store.graphInstance.resetSelfCentric();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="selectednodes"
                        isDisabled={
                            !store.graph.currentGraphData.selectedNodes.length
                        }
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<RadioChecked style={{ '--ggs': '0.6' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show selected nodes'
                            );
                            store.graphInstance.triggerSelectedNodes();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show connections with same entries as origin node">
                    <IconButton
                        borderRadius="6px"
                        id="mutualentriesoriginbutton"
                        isDisabled={!store.graphInstance.selfCentricOriginNode}
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)',
                            paddingTop: '5px'
                        }}
                        icon={<FormatSeparator style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show nodes with same entries as context node'
                            );
                            store.graphInstance.triggerSameEntry();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show connections with same entries as selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="mutualentriesoriginbutton"
                        isDisabled={
                            store.graph.currentGraphData.selectedNodes.length <
                            2
                        }
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)',
                            paddingTop: '1px'
                        }}
                        icon={<DisplayFullwidth style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show nodes with same entries as context node'
                            );
                            store.graphInstance.triggerSameEntry(true);
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show direct connections of selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="alldirectconnections"
                        isDisabled={
                            store.graph.currentGraphData.selectedNodes.length <
                            2
                        }
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<PathDivide style={{ '--ggs': '0.8' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show union of direct all connections'
                            );
                            store.graphInstance.triggerMultiSelfCentric();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show mutual connections of selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="mutualconnectionsbutton"
                        isDisabled={
                            store.graph.currentGraphData.selectedNodes.length <
                            2
                        }
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<PathIntersect style={{ '--ggs': '0.8' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show intersection of direct connections'
                            );
                            store.graphInstance.triggerMultiSelfCentric(true);
                        }}
                    />
                </Tooltip>
            </HStack>
            <Divider
                orientation="vertical"
                style={{
                    height: '26px',
                    width: '1px'
                }}
            />
            <HStack spacing="1">
                <Tooltip label="Show direct connections of origin node">
                    <IconButton
                        borderRadius="6px"
                        id="directconnections"
                        isDisabled={originNodeExists}
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<LivePhoto style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show direct connections of origin node'
                            );
                            store.graphInstance.triggerSelfCentric();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show mutual connections with origin node">
                    <IconButton
                        borderRadius="6px"
                        id="mutualconnectionsoriginbutton"
                        isDisabled={originNodeExists}
                        size="sm"
                        style={{
                            backdropFilter: 'blur(2px)'
                        }}
                        icon={<LayoutPin style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show intersection of direct connections with origin node'
                            );
                            store.graphInstance.triggerMultiSelfCentric(
                                true,
                                true
                            );
                        }}
                    />
                </Tooltip>
            </HStack>
        </HStack>
    );
    return (
        <Box
            minW="50px"
            maxW="300px"
            borderRight="1px solid"
            borderColor={edgeColor}
            position="fixed"
            left="0px"
            height="100%"
            zIndex="2"
            marginTop="50px"
            id="controlpanel"
        >
            <Tabs
                variant="line"
                orientation="vertical"
                colorScheme="blue"
                height="100%"
                borderColor={tabBorderColor}
                isLazy
            >
                <TabList
                    position="absolute"
                    top="0"
                    width="50px"
                    height="100%"
                    zIndex="2"
                    bgColor={tabListbgColor}
                    style={{ backdropFilter: 'blur(2px)' }}
                >
                    <Tooltip label={isOpen ? 'Minimize' : 'Maximize'}>
                        <IconButton
                            borderRadius="0"
                            variant="link"
                            width="50px"
                            height="50px"
                            color={tabInactiveColors}
                            onClick={toggleControlPanel}
                            icon={
                                isOpen ? (
                                    <ChevronDoubleLeft />
                                ) : (
                                    <ChevronDoubleRight />
                                )
                            }
                        />
                    </Tooltip>
                    <Tab
                        width="50px"
                        height="50px"
                        onClick={() => {
                            openSliderIfClosed();
                            store.track.trackEvent(
                                'controls panel',
                                'button click',
                                'show view controls'
                            );
                        }}
                        padding="8px"
                        style={
                            isOpen
                                ? {}
                                : {
                                      color: tabInactiveColors,
                                      borderColor: 'transparent'
                                  }
                        }
                    >
                        <Tooltip label="View settings">
                            <Box
                                id="viewsettingstab"
                                width="100%"
                                height="100%"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Eye />
                            </Box>
                        </Tooltip>
                    </Tab>
                </TabList>
                <Slide
                    direction="left"
                    id="controlpanelslide"
                    in={isOpen}
                    position="fixed"
                    left="50px"
                    style={{
                        position: 'fixed',
                        width: '250px',
                        bottom: '0px',
                        marginTop: '50px'
                    }}
                >
                    <TabPanels
                        width="250px"
                        height="100%"
                        marginLeft="50px"
                        bgColor={bgColor}
                        borderRight="1px solid"
                        borderColor={edgeColor}
                        position="relative"
                        style={{ backdropFilter: 'blur(2px)' }}
                    >
                        <TabPanel
                            width="250px"
                            overflowY="scroll"
                            height="100%"
                        >
                            <SettingsComponent />
                        </TabPanel>
                    </TabPanels>

                    {renderDirectConnectionsMenu()}

                    {store.core.currentGraph &&
                        !['none', 'component'].includes(
                            store.graphInstance.selectedColorSchema
                        ) &&
                        renderColorLegend()}
                </Slide>
            </Tabs>
        </Box>
    );
}

export default observer(ControlPanel);

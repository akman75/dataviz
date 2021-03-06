import axios from 'axios';
import { makeAutoObservable } from 'mobx';

export class SearchStore {
    nodeTypes = [];
    newNodeTypes = [];
    anchor = '';
    links = [];
    schema = [];
    schemas = [];
    datasets = [];
    currentDataset = null;
    currentDatasetIndex = 0;
    connector = '';
    searchIsEmpty = false;
    advancedSearchQuery = '';

    constructor(store) {
        this.store = store;
        makeAutoObservable(this);
        this.getDatasets();
    }

    setAdvancedSearchQuery = val => (this.advancedSearchQuery = val);

    setSearchIsEmpty = searchIsEmpty => (this.searchIsEmpty = searchIsEmpty);

    useDataset = index => {
        this.currentDataset = this.datasets[index];
        this.currentDatasetIndex = index;

        localStorage.setItem('currentDataset', this.currentDataset);
        localStorage.setItem('currentDatasetIndex', this.currentDatasetIndex);

        const dataset_config = JSON.parse(
            this.getLocalStorageDataset(this.datasets[index])
        );

        this.links = dataset_config.links;

        this.schema = dataset_config.schemas[0]['relations'];
        this.schemas = dataset_config.schemas;

        this.nodeTypes = dataset_config.types;
        this.anchor = dataset_config.anchor;
        this.store.schema.populateStoreData();
    };

    changeSelectedSchema = selectedSchema => {
        this.schema =
            this.schemas[
                this.schemas.findIndex(entry => entry.name === selectedSchema)
            ]['relations'];
        this.store.schema.populateStoreData();
    };

    getLocalStorageDataset = dataset_name =>
        localStorage.getItem(`index_${dataset_name}`);

    setLocalStorageDataset = (dataset_name, dataset) =>
        localStorage.setItem(`index_${dataset_name}`, JSON.stringify(dataset));

    initDatasets = datasets => {
        for (let dataset_name in datasets) {
            // If dataset doesn't exist add it to the local storage
            if (!this.getLocalStorageDataset(dataset_name)) {
                this.setLocalStorageDataset(
                    dataset_name,
                    datasets[dataset_name]
                );
            }

            this.datasets = [...this.datasets, dataset_name];
        }
    };

    updateCurrentDatasetSchema = schema => {
        const dataset_config = JSON.parse(
            this.getLocalStorageDataset(this.currentDataset)
        );

        dataset_config['schema'] = schema;

        this.setLocalStorageDataset(this.currentDataset, dataset_config);
    };

    getDatasets = () => {
        axios
            .get('search/datasets')
            .then(response => {
                // Initialise dataset locally and set the current dataset
                this.initDatasets(response.data);

                const currentDataset = localStorage.getItem('currentDataset');

                if (currentDataset && this.datasets.includes(currentDataset)) {
                    this.useDataset(this.datasets.indexOf(currentDataset));
                } else {
                    this.useDataset(0);
                }
            })
            .catch(error => this.store.core.handleError(error));
    };

    search = async (query, nodeTypes, schema, connector, graphType) => {
        // Set search parameters
        const params = {
            query: query,
            connector: connector ? connector : null,
            anchor: this.anchor,
            graph_type: graphType,
            visible_entries: []
        };

        if (graphType === 'overview') {
            params.anchor_properties = JSON.stringify(
                this.store.schema.overviewDataNodeProperties
            );
        }

        if (
            graphType === 'detail' &&
            this.store.graph.graphData.selectedComponents.length
        ) {
            const entryArray = this.store.graph.graphData.components
                .filter(component =>
                    this.store.graph.graphData.selectedComponents.includes(
                        component.id
                    )
                )
                .reduce(
                    (entries, component) => entries.concat(component.entries),
                    []
                );

            params.visible_entries = JSON.stringify([...new Set(entryArray)]);
        }

        params['links'] = JSON.stringify(this.links);

        // Set schema by using the provided schema or reading from store
        if (schema && schema.length) {
            params['schema'] = JSON.stringify(schema);
        } else if (localStorage.getItem('schema')) {
            params['schema'] = JSON.stringify(
                this.store.schema.getServerSchema()
            );
        }

        // Set the node types the user wants to view
        if (nodeTypes && Object.keys(nodeTypes).length) {
            params['visible_dimensions'] = JSON.stringify(nodeTypes);
        }

        // Set selected index
        params['index'] = localStorage.getItem('currentDataset');

        try {
            const response = await axios.get('search', { params });
            return response.data;
        } catch (error) {
            return this.store.core.handleError(error);
        }
    };
}

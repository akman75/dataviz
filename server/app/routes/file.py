import pandas as pd
import json
import os

from fastapi import APIRouter, UploadFile
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk

router = APIRouter()

es = Elasticsearch("csx_elastic:9200", retry_on_timeout=True)


@router.post("/upload")
def uploadfile(file: UploadFile):
    data = pd.read_csv(file.file)

    columns = data.dtypes.to_dict()

    for column in list(columns.keys()):
        if columns[column] == object:
            if isinstance(data.iloc[0][column], list):
                columns[column] = "list"
            else:
                columns[column] = "string"
        else:
            columns[column] = "number"

    data.to_csv(f'./app/data/files/{file.filename.rpartition(".")[0]}.csv')

    return {"name": file.filename.rpartition(".")[0], "columns": columns}


def get_default_visible_dimensions(defaults):
    visible_dimensions = []

    for key in defaults:
        if defaults[key]["isDefaultVisible"]:
            visible_dimensions.append(defaults[key]["name"])

    return visible_dimensions


def get_default_searchable_dimensions(defaults):
    searchable_dimensions = []

    for key in defaults:
        if defaults[key]["isDefaultSearch"]:
            searchable_dimensions.append(defaults[key]["name"])

    return searchable_dimensions


def get_default_link_dimensions(defaults):
    link_dimensions = []

    for key in defaults:
        if defaults[key]["isDefaultLink"]:
            link_dimensions.append(defaults[key]["name"])

    return link_dimensions


def get_remove_row_if_null_dimensions(defaults):
    remove_row_if_null_dimensions = []

    for key in defaults:
        if defaults[key]["removeIfNull"]:
            remove_row_if_null_dimensions.append(defaults[key]["name"])

    return remove_row_if_null_dimensions


def get_renamed_dimensions(defaults):
    dimension_name_mapping = {}

    for key in defaults:
        if defaults[key]["name"] != key:
            dimension_name_mapping[key] = defaults[key]["name"]

    return dimension_name_mapping


def get_dimensions(defaults):
    return [defaults[key]["name"] for key in defaults]


def generateEntriesFromDataFrame(data, columns, index):
    for i, row in data.iterrows():
        doc = {col: str(row[col]) for col in columns}
        doc["_index"] = index
        yield doc


@router.get("/settings")
def set_defaults(original_name: str, name="", anchor="", defaults="{}"):
    defaults = json.loads(defaults)

    # Generate default config
    config = {
        "default_visible_dimensions": get_default_visible_dimensions(defaults),
        "anchor": anchor,
        "links": get_default_link_dimensions(defaults),
        "default_search_fields": get_default_searchable_dimensions(defaults),
        "schemas": [{"name": "default", "relations": []}],
    }

    with open(f"./app/data/config/{name}.json", "w") as f:
        json.dump(config, f)

    data = pd.read_csv(f"./app/data/files/{original_name}.csv")

    rename_mapping = get_renamed_dimensions(defaults)
    if bool(rename_mapping):
        data.rename(columns=rename_mapping, inplace=True)

    null_dimensions = get_remove_row_if_null_dimensions(defaults)
    if len(null_dimensions) != 0:
        data.dropna(axis=0, subset=null_dimensions, inplace=True)

    columns = get_dimensions(defaults)

    if not es.indices.exists(index=name):
        es.indices.create(index=name)

    bulk(es, generateEntriesFromDataFrame(data, columns, name))

    os.remove(f"./app/data/files/{original_name}.csv")

    return {"status": "success"}


@router.get("/cancel")
def cancel_dataset_upload(name: str):
    os.remove(f"./app/data/files/{name}.csv")
    return {"status": "success"}


@router.get("/delete")
def delete_dataset(name: str):
    es.indices.delete(index=name)
    os.remove(f"./app/data/config/{name}.json")
    return {"status": "success"}

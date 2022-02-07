import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { FilterMatchMode } from 'primereact/api'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
//import { SERVER } from "./global";


function FavouriteList(props) {
    const navigate = useNavigate()

    const [isDialogShown, setIsDialogShown] = useState(false)
    const [favouriteList, setFavouriteList] = useState([])
    const [descriere, setDescriere] = useState('')
    const [date, setDate] = useState('')
    const [isNewRecord, setIsNewRecord] = useState(true)
    const [count, setCount] = useState(0)
    const [sortField, setSortField] = useState('')
    const [sortOrder, setSortOrder] = useState(1)
    const [selectedFavouriteList, setSelectedFavouriteList] = useState(null)
    const [filterString, setFilterString] = useState('')
    const [filters, setFilters] = useState({
        listID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        descriere: { value: null, matchMode: FilterMatchMode.CONTAINS }

    })


    const [page, setPage] = useState(0)
    const [first, setFirst] = useState(0)

    const SERVER = "http://localhost:8080"

    const getFavouriteList = async (filterString, page, pageSize, sortField, sortOrder) => {
        const response = await fetch(`${SERVER}/favouriteLists?${filterString}&sortField=${sortField || ''}&sortOrder=${sortOrder || ''}&page=${page || ''}&pageSize=${pageSize || ''}`)
        const data = await response.json()
        setFavouriteList(data.records)
        setCount(data.count)
    }

    const addFavouriteList = async (favouriteList) => {
        await fetch(`${SERVER}/favouriteLists`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(favouriteList)
        })
        getFavouriteList(filterString, page, 2, sortField, sortOrder)
    }

    const editFavouriteList = async (favouriteList) => {
        console.log(favouriteList);
        await fetch(`${SERVER}/favouriteLists/${favouriteList.selectedFavouriteList}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(favouriteList)
        })
        getFavouriteList(filterString, page, 2, sortField, sortOrder)
    }

    const deleteFavouriteList = async (favouriteList) => {
        await fetch(`${SERVER}/favouriteLists/${favouriteList}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        getFavouriteList(filterString, page, 2, sortField, sortOrder)
    }

    useEffect(() => {
        getFavouriteList(filterString, page, 2, sortField, sortOrder)
    }, [filterString, page, sortField, sortOrder])

    const handleFilter = (evt) => {
        const oldFilters = filters
        oldFilters[evt.field] = evt.constraints.constraints[0]
        console.log(oldFilters);
        setFilters({ ...oldFilters })
    }

    useEffect(() => {
        const keys = Object.keys(filters)
        const computedFilterString = keys.map(e => {
            return {
                key: e,
                value: filters[e].value
            }
        }).filter(e => e.value).map(e => `${e.key}=${e.value}`).join('&')
        setFilterString(computedFilterString)
    }, [filters])

    const handleFilterClear = (evt) => {
        setFilters({
            listID: { value: null, matchMode: FilterMatchMode.CONTAINS },
            abstract: { value: null, matchMode: FilterMatchMode.CONTAINS }
        })
    }

    const handleAddClick = (ev) => {


        setIsDialogShown(true)
        setIsNewRecord(true)
        //setID('')
        setDescriere('')
        setDate('')
    }

    const handleSaveClick = () => {
        if(isNewRecord){
            addFavouriteList({descriere, date})
        }else{
            editFavouriteList({selectedFavouriteList,descriere, date})
        }
        setIsDialogShown(false)
        setSelectedFavouriteList(null)
        setDescriere('')
        setDate('')
    }

    const tableFooter = (
        <div>
            <Button label='Add' icon='pi pi-plus' onClick={handleAddClick} />
        </div>
    )

    const dialogFooter = (
        <div>
            <Button label='Save' icon='pi pi-save' onClick={handleSaveClick} />
        </div>
    )

    const handleEditFavouriteList = (rowData) => {
        setSelectedFavouriteList(rowData.listID)
        setDescriere(rowData.descriere)
        setDate(rowData.date)
        
        setIsDialogShown(true)
        setIsNewRecord(false)
      }

    const handleDelete = (rowData) => {
        setSelectedFavouriteList(rowData.listID)
        deleteFavouriteList(rowData.listID)
    }  


    const opsColumn = (rowData) => {
        return (
            <>
                <Button label='Edit' icon='pi pi-pencil' onClick={()=>handleEditFavouriteList(rowData)}/>
                <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={()=>handleDelete(rowData)} />
                <Button label='Videos' className='p-button p-button-success' onClick={() => navigate(`/${rowData.listID}/videos`)} />

            </>
        )
    }

    const handlePageChange = (evt) => {
        setPage(evt.page)
        setFirst(evt.page * 2)
    }

    const handleSort = (evt) => {
        console.warn(evt)
        setSortField(evt.sortField)
        setSortOrder(evt.sortOrder)
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    return (
        <div style={{"display": "grid"}}>
            <DataTable
                value={favouriteList}
                footer={tableFooter}
                lazy
                paginator
                onPage={handlePageChange}
                first={first}
                rows={2}
                totalRecords={count}
                onSort={handleSort}
                sortField={sortField}
                sortOrder={sortOrder}
            >
                <Column header='ID' field='listID' filter filterField='listID' filterPlaceholder='filter by listID' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
                <Column header='Descriere' field='descriere' filter filterField='descriere' filterPlaceholder='filter by descriere' onFilterApplyClick={handleFilter} onFilterClear={handleFilterClear} sortable />
                <Column header='Date' field='date' />
                <Column body={opsColumn} />
            </DataTable>
            <Dialog header='A list of favourites' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
                <div>
                    <InputText placeholder='descriere' onChange={(evt) => setDescriere(evt.target.value)} value={descriere} />
                </div>
                <div>
                    <InputText placeholder='date' onChange={(evt) => setDate(evt.target.value)} value={date} />
                </div>
            </Dialog>

        </div>

    );
}

export default FavouriteList;

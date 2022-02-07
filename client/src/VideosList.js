import {useParams} from 'react-router-dom'
import React, {useState, useEffect} from 'react';
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
//import { SERVER } from "./global";

function VideosList(props) {
    
    // listID
    const {id} = useParams()
    
    const [isDialogShown, setIsDialogShown] = useState(false)
    const [videos, setVideos] = useState([])
    const [descriere, setDescriere] = useState('')
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [selectedVideo, setSelectedVideo] = useState(null)
    const [isNewRecord, setIsNewRecord] = useState(true)

    const SERVER = "http://localhost:8080"

    const getVideos = async () => {
        const response = await fetch(`${SERVER}/favouriteLists/${id}/videos`)
        const data = await response.json()
        setVideos(data)
    }

    const addVideo = async (video) => {
        await fetch(`${SERVER}/favouriteLists/${id}/videos`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(video)
        })
        getVideos()

    }

    const editVideo = async (video) => {
        await fetch(`${SERVER}/favouriteLists/${id}/videos/${video.selectedVideo}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(video)
        })
        getVideos()
    }

    const deleteVideo = async (vid) => {
        await fetch(`${SERVER}/favouriteLists/${id}/videos/${vid}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        getVideos()
    }

    useEffect(() => {
        getVideos()
    })

    const handleAddClick = (ev) => {
        setIsDialogShown(true)
        setIsNewRecord(true)
        setDescriere('')
        setTitle('')
        setUrl('')
    }

    const handleSaveClick = () => {
        if(isNewRecord){
            addVideo({descriere, title, url})
        }else{
            editVideo({selectedVideo,descriere, title, url})
        }
        setIsDialogShown(false)
        setSelectedVideo(null)
        setDescriere('')
        setTitle('')
        setUrl('')
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

    const handleEditVideo = (rowData) => {
        setSelectedVideo(rowData.videoID)
        setDescriere(rowData.descriere)
        setTitle(rowData.title)
        setUrl(rowData.url)
        
        setIsDialogShown(true)
        setIsNewRecord(false)
      }

    const handleDelete = (rowData) => {
        console.log(rowData.videoID);
        
        setSelectedVideo(rowData.videoID)
        deleteVideo(rowData.videoID)
    }  


    const opsColumn = (rowData) => {
        return (
            <>
                <Button label='Edit' icon='pi pi-pencil' onClick={()=>handleEditVideo(rowData)}/>
                <Button label='Delete' icon='pi pi-times' className='p-button p-button-danger' onClick={()=>handleDelete(rowData)} />

            </>
        )
    }

    const hideDialog = () => {
        setIsDialogShown(false)
    }

    return (
      <div style={{"display": "grid"}}>
          <DataTable
                value={videos}
                footer={tableFooter}
                lazy
                rows={2}
            >
                <Column header='Descriere' field='descriere' />
                <Column header='Title' field='title' />
                <Column header='Url' field='url' />
                <Column body={opsColumn} />
            </DataTable>
            <Dialog header='A video' visible={isDialogShown} onHide={hideDialog} footer={dialogFooter}>
                <div>
                    <InputText placeholder='descriere' onChange={(evt) => setDescriere(evt.target.value)} value={descriere} />
                </div>
                <div>
                    <InputText placeholder='title' onChange={(evt) => setTitle(evt.target.value)} value={title} />
                </div>
                <div>
                    <InputText placeholder='url' onChange={(evt) => setUrl(evt.target.value)} value={url} />
                </div>
            </Dialog>
      </div>
  
      );
  }
  
  export default VideosList;
  
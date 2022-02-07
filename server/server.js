require('dotenv').config({})
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const Op = Sequelize.Op
const path = require('path')

let sequelize

sequelize = new Sequelize({
    dialect : 'sqlite',
    storage: 'test.db'
})

// if(process.env.NODE_ENV === 'development') {
//     sequelize = new Sequelize({
//         dialect : 'sqlite',
//         storage: 'test.db'
//     })
    
// } else{
//     sequelize = new Sequelize(process.env.DATABASE_URL,{
//         dialect: 'postgres',
//         protocol: 'postgres',
//         dialectOptions:{
//             ssl:{
//                 require: true,
//                 rejectUnauthorized: false
//             }
    
//         }
//     });
// } 

const FavouriteList = sequelize.define('favouriteList', {
    listID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    descriere: Sequelize.TEXT,
    date: Sequelize.DATE
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,

});

const Video = sequelize.define('video', {
    videoID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    descriere: Sequelize.TEXT,
    title: Sequelize.TEXT,
    url: Sequelize.TEXT,
    listID: Sequelize.INTEGER,
}, {
    freezeTableName: true,
    timestamps: false,
    createdAt: false,

});

FavouriteList.hasMany(Video, { foreignKey: 'listID' });

async function checkIfExists() {
    try {
        await FavouriteList.sync({ force: true });
        await Video.sync({ force: true });

    } catch (error) {
        console.error(error.message)
    }
}

//checkIfExists()

const app = express()
app.use(cors())
//app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json());

// HTTP requests

// sync method
// app.get('/sync', async (req, res) => {
//     try {
//       await sequelize.sync({ force: true })
//       res.status(201).json({ message: 'created' })
//     } catch (e) {
//       console.warn(e)
//       res.status(500).json({ message: 'server error' })
//     }
// })
  

// ========== LIST
// SELECT ALL WITH SORT, FILTER, PAGE
app.get('/favouriteLists', async (req, res) => {
    try {
      const query = {}
      let pageSize = 2
      const allowedFilters = ['listID', 'descriere']
      const filterKeys = Object.keys(req.query).filter(e => allowedFilters.indexOf(e) !== -1)
      if (filterKeys.length > 0) {
        query.where = {}
        for (const key of filterKeys) {
          query.where[key] = {
            [Op.like]: `%${req.query[key]}%`
          }
        }
      }
  
      const sortField = req.query.sortField
      let sortOrder = 'ASC'
      if (req.query.sortOrder && req.query.sortOrder === '-1') {
        sortOrder = 'DESC'
      }
  
      if (req.query.pageSize) {
        pageSize = parseInt(req.query.pageSize)
      }
  
      if (sortField) {
        query.order = [[sortField, sortOrder]]
      }
  
      if (!isNaN(parseInt(req.query.page))) {
        query.limit = pageSize
        query.offset = pageSize * parseInt(req.query.page)
      }
  
      const records = await FavouriteList.findAll(query)
      console.log(query);
      console.log(records);
      const count = await FavouriteList.count()
      if(records.length == 0){
        res.status(200).json({ message: 'no recoreds found' })
      }else{
      res.status(200).json({ records, count })
      }
    } catch (e) {
      console.warn(e)
      res.status(500).json({ message: 'server error' })
    }
  })


// SELECT List WITH ID
app.get('/favouriteLists/:id', async (req, res) => {
    try {
        let favList = await FavouriteList.findByPk(req.params.id)
        if (favList) {
            res.status(200).json(favList)
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})


// INSERT
app.post('/favouriteLists', async (req, res) => {
    try {
        let descriere = req.body.descriere
        if (descriere.length >= 5) {
            await FavouriteList.create(req.body)
            res.status(201).json({ message: 'FavouriteList created successfully!' })
        }
        else{
            res.status(400).json({ message: 'FavouriteList not created!' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// UPDATE
app.put('/favouriteLists/:id', async (req, res) => {
    try {
        let favList = await FavouriteList.findByPk(req.params.id)
        if (favList) {
            await favList.update(req.body)
            res.status(202).json({ message: 'accepted' })
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})

// DELETE
app.delete('/favouriteLists/:id', async (req, res) => {
    try {
        let favList = await FavouriteList.findByPk(req.params.id)

        if (favList) {
            await favList.destroy()
            res.status(202).json({ message: 'accepted' })
            console.log('favouriteList deleted');
        }
        else {
            res.status(404).json({ message: 'not found' })
        }
    }
    catch (e) {
        console.warn(e)
        res.status(500).json({ message: 'server error' })
    }
})


// =========== VIDEO
// SELECT ALL VIDEOS BASED ON ID FAVOURITELIST
app.get('/favouriteLists/:lid/videos', async (req, res) => {
	try{
		let favList = await FavouriteList.findByPk(req.params.lid)
		if (favList){
			let videos = await favList.getVideos()
			res.status(200).json(videos)
		}
		else{
			res.status(404).json({message : 'not found'})
		}
	}
	catch(e){
		console.warn(e)
		res.status(500).json({message : 'server error'})
	}
})

// SELECT VIDEO BASED ON ID FAVLIST AND VIDEO ID
app.get('/favouriteLists/:lid/videos/:vid', async (req, res) => {
	try{
		let favList = await FavouriteList.findByPk(req.params.lid)
		if (favList){
			let videos = await favList.getVideos({where : {videoID : req.params.vid}})
			res.status(200).json(videos.shift())
		}
		else{
			res.status(404).json({message : 'not found'})
		}
	}
	catch(e){
		console.warn(e)
		res.status(500).json({message : 'server error'})
	}
})

// INSERT VIDEO BASED ON ID FAVLIST
app.post('/favouriteLists/:lid/videos', async (req, res) => {
	try{
		let favList = await FavouriteList.findByPk(req.params.lid)
		if (favList){
			let video = req.body
			video.listID = favList.listID
			await Video.create(video)
			res.status(201).json({message : 'created'})
		}
		else{
			res.status(404).json({message : 'not found'})
		}
	}
	catch(e){
		console.warn(e)
		res.status(500).json({message : 'server error'})
	}
})

// UPDATE VIDEO BASED ON ID FAVLIST AND VIDEO ID
app.put('/favouriteLists/:lid/videos/:vid', async (req, res) => {
	try{
		let favList = await FavouriteList.findByPk(req.params.lid)
		if (favList){
			let videos = await favList.getVideos({where : {listID : req.params.lid}})
			let video = videos.shift()
			if (video){
				await video.update(req.body)
				res.status(202).json({message : 'accepted'})
			}
			else{
				res.status(404).json({message : 'not found'})
			}
		}
		else{
			res.status(404).json({message : 'not found'})
		}
	}
	catch(e){
		console.warn(e)
		res.status(500).json({message : 'server error'})
	}
})

// DELETE VIDEO BASED ON ID FAVLIST AND VIDEO ID
app.delete('/favouriteLists/:lid/videos/:vid', async (req, res) => {
	try{
		let favList = await FavouriteList.findByPk(req.params.lid)
		if (favList){
			let videos = await favList.getVideos({where : {listID : req.params.lid}})
			let video = videos.shift()
			if (video){
				await video.destroy(req.body)
				res.status(202).json({message : 'accepted'})
			}
			else{
				res.status(404).json({message : 'not found'})
			}
		}
		else{
			res.status(404).json({message : 'not found'})
		}
	}
	catch(e){
		console.warn(e)
		res.status(500).json({message : 'server error'})
	}
})

app.listen(8080)

var db=require('../config/connection')
var collection=require('../config/collections');
const objectId  = require('mongodb').ObjectId;
const { response } = require('express');
module.exports={

    addProduct:(product,cb)=>{
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);
            cb(data.insertedId)
        })

    },
    putProducts: ()=>{
        return new Promise (async(resolve,reject)=>{
            let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            // console.log(products);
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise ((resolve,reject)=>{
            console.log(proId);
            console.log(objectId(proId));
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })
        })

    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
    updateProduct:(productDetails,proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name: productDetails.Name,
                    Category: productDetails.Category,
                    Price: productDetails.Price,
                    descri:productDetails.descri,
                }
            }).then((response)=>{
                resolve()
            })

        })
    }

}
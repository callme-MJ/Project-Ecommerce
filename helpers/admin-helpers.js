var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const objectId  = require('mongodb').ObjectId;
const { USER_COLLECTION, CART_COLLECTION } = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');
const { resource } = require('../app');

module.exports={
    adminLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
           
            let loginStatus=false
            let response={}
            let admin= await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if (admin) {
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    if (status) {
                        response.admin=admin
                        response.status=true
                        console.log('login success');
                        resolve(response)

                    }else{
                        resolve({status:false})
                        console.log('login failed')    
                    }
                })

                }else{
                    resolve({status:false})
                    console.log('login failed')
                }

        })

    },
    getUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users= await db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(users)
               
            
        })
        
        
    },
    getOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    }
    
}
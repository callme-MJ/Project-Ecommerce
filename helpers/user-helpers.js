var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const objectId  = require('mongodb').ObjectId;
const { USER_COLLECTION, CART_COLLECTION } = require('../config/collections');
const { ObjectId } = require('mongodb');
const { response } = require('express');


module.exports={
    doSignup:(Data)=>{
        return new Promise (async(resolve,reject)=>{
            let userData={
                Password:Data.Password=await bcrypt.hash(Data.Password,10),
                Name:Data.Name,
                Email:Data.Email,
                Date:new Date(Date.now()),
            }
            
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data.insertedId);
                console.log(date);

            })
            
        })

    },
    doLogin:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            let loginStatus=false
            let response={}
           let user= await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
           if(user){
               bcrypt.compare(userData.Password,user.Password).then((status)=>{
                   if(status){
                       console.log('login Success');
                       response.user=user
                       response.status=true
                       resolve(response)
                       
                   }
                   else{
                       console.log('login failed')
                       resolve({status:false})
                       
                   }
               })

           }
           else{
               console.log('login failed')
               resolve({status:false})
           }
        })
    },
    addToCart:(userId,proId)=>{
            let proObj={
                item:objectId(proId),
                quantity:1
            }
        return new Promise(async(resolve,reject)=>{
            let userCart= await db.get().collection(collection.CART_COLLECTION)
            .findOne({user:ObjectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId)
                // console.log(proExist);
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId)},
                    {
                        $push:{products:proObj}
                    }
                    ).then((response)=>{
                        resolve()
                    })
                }

            }else{
                let cartOb={
                    user:objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartOb).then((response)=>{
                    resolve()
                })
            }

        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },    
                    {
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]}

                    }
                }
                
                
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let count=0
            let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count= cart.products.length
            }
            resolve(count)
            
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.products)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
            db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:objectId(details.cart),'products.item':objectId(details.products)},
                    {
                        $inc:{'products.$.quantity':details.count}
                    }).then((response)=>{
                        resolve({status:true})
                    })
                }   

        })
    },
    removeItem:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.products)}}
                }
                ).then((response)=>{
                    resolve({response})
                })

        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'products'
                    }
                },    
                    {
                    $project:{
                        item:1,quantity:1,products:{$arrayElemAt:['$products',0]}

                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$convert:{input:'$products.Price',to:'int'}}]}}

                    }
                }
                
                
            ]).toArray()
            //console.log(total[0].total);
            resolve(total[0].total)
        })

    },
    placeOrder:(order,products,total)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    email:order.email,
                    address:order.address,
                    city:order.city,
                    state:order.state,
                    pin:order.pin
                    
                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date: new Date(Date.now()),
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve()
            })
        })
    },
    getCartProductsList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION)
            .findOne({user:objectId(userId)})
            resolve(cart.products)
        })
    } 
}
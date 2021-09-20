var express = require('express');
const { response, resource, rawListeners } = require('../app');
var router = express.Router();
var productHelper =require('../helpers/product-helpers');
const { getTotalAmount } = require('../helpers/user-helpers');
var userHelper=require('../helpers/user-helpers')
var adminHelper =require('../helpers/admin-helpers');
const e = require('express');

const verifyLogin=(req,res,next)=>{
  if (req.session.admin) {
    next()
  }else{
    res.redirect('/admin/adlogin')
  }
}
/* GET users listing. */
router.get('/', verifyLogin,function(req, res, next) {
  let admin= req.session.admin
  productHelper.putProducts().then((products)=>{
    res.render('admin/show-products',{user:false,admin, products});
    })
  })

router.get('/adlogin',function(req,res){
  
    res.render('admin/adminlogin')
})

router.post('/adlogin',(req,res)=>{
  adminHelper.adminLogin(req.body).then((response)=>{
    if (response.status) {
     
      req.session.admin = response.admin
      req.session.admin.loggedIn =true
      res.redirect('/admin')
    }else{
      req.session.adminLoginErr=true
      res.redirect('/admin/adlogin')
    }
  
})
})

router.get('/adlogout',(req,res)=>{
  req.session.admin.loggedIn=false
  req.session.admin=null
  
  res.redirect('/admin/adlogin')
})
router.get('/add-products',verifyLogin,function(req,res){
  res.render('admin/add-products',{admin:req.session.admin})
})

router.post('/add-products', (req,res)=>{
  
  productHelper.addProduct(req.body,(id)=>{
    let image =req.files.image
    // console.log(id);
    
    image.mv('./public/images/'+id+'.jpg',(err)=>{
      if(!err){
        res.redirect('/admin/')

      }
      else{
        console.log(err);
      }
    })
    
  })
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })

})
router.get('/edit-product/:id',async(req,res)=>{
  let product= await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product',{product})
  //console.log(product);
})
router.post('/edit-product/:id',(req,res)=>{
  productHelper.updateProduct(req.body,req.params.id).then((response)=>{
    res.redirect('/admin/')
    if(req.files.image){
      let image= req.files.image
      image.mv('./public/images/'+req.params.id+'.jpg')
    }
  })

})
router.get('/all-users',verifyLogin,(req,res)=>{
    adminHelper.getUsers().then((users)=>{
    res.render('admin/allusers',{users,admin:req.session.admin})
    // console.log(users);
  })
  
  
})
router.get('/orders',(req,res)=>{
  adminHelper.getOrders().then((orders)=>{
    res.render('admin/allorders',{admin:req.session.admin,orders})
  })
  
})
module.exports = router;

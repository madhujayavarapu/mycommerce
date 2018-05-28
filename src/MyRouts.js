/*eslint-disable*/
import React, { Component } from 'react';
import {BrowserRouter, Route, Link} from 'react-router-dom';
import App from './App.js';
import NewItem from './NewItem.js';
import { Layout, Menu, Icon, Modal, Button, Input,
        notification, Badge, Row, Col, InputNumber, message} from 'antd';
import * as firebase from 'firebase';
import street from './street.svg';

const { Header, Footer, Sider, Content } = Layout;


class MyRouts extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            visible : false,
            loggedIn : false,
            currentUser : null,
            cartItemCount : 0,
            cartVisible : false,
            cartItems : [],
            order : false
        };
        this.handleSiderMenuClick = this.handleSiderMenuClick.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleAuthChange = this.handleAuthChange.bind(this);
        this.renderNewItem = this.renderNewItem.bind(this);
        this.showModalLoginWindowDisplay = this.showModalLoginWindowDisplay.bind(this);
        this.renderApp = this.renderApp.bind(this);
        this.handleHeaderMenuClick = this.handleHeaderMenuClick.bind(this);
        this.getCartContent = this.getCartContent.bind(this);
        this.handleCartDelete = this.handleCartDelete.bind(this);
        this.handleCartQuantityChange = this.handleCartQuantityChange.bind(this);
        this.handleCheckOut = this.handleCheckOut.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    
   handleHeaderMenuClick(propsPassed){
        console.log("headermenuclick.");
        if (propsPassed.key == 1){
            console.log("clicked the cart item");
            this.setState({
                cartVisible : true
            });
        }
        else{
            console.log("not clicked the cart item");
            this.setState({
                cartVisible : false
            });

        }
    }
    handleSiderMenuClick(propsPassed){
        console.log(propsPassed);
        if (propsPassed.key == 3){
            if(this.state.loggedIn != true){
                this.setState({
                    visible : true
                });  
                this.showLoginWindow
            }
            else{
                firebase.auth().signOut();
            }

        }
    }
    
    handleCancel(){
        this.setState({
            visible : false,
            cartVisible : false,
            order: false
        });
    }
    
    authRedirectSuccess (result){
        console.log(result);
        if (result.user != null){
            notification.success({
                message: 'Welcome '+result.user.displayName,
                description: 'have a great shopping experience!'
             });    
        }

    }
    
    authRedirectFail (reason){
        console.log(reason);
    }
    
    handleAuthChange(user){
        if(user != null){
            this.databaseRef = firebase.database().ref('cart/'+user.uid);
            
            this.databaseRef.on('value',(dataSnap) => {
               if(dataSnap.val()!=null){
                       this.setState({
                       cartItemCount : Object.keys(dataSnap.val()).length,
                       cartItems: dataSnap.val()
                   });
                }else{
                    this.setState({
                        cartItemCount : 0
                    })
                }
            })
            
            this.setState({
               loggedIn : true,
               currentUser : user
            });
            
        }
        else{
           this.databaseRef.off();
           this.setState({
               loggedIn : false,
               currentUser : null,
               cartItemCount : 0
            }); 
        }
    }
    
    componentDidMount (){
        console.log("in componentDid mount");
        firebase.auth().getRedirectResult().then(this.authRedirectSuccess).catch(this.authRedirectFail);
        firebase.auth().onAuthStateChanged(this.handleAuthChange);
        this.databaseRef2 = firebase.database().ref('order');
    }
   
    
    handleGoogleLogin(){
        console.log("in handleGoogleLogin");
        let provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
        
    }
    
    handleFBLogin(){
        let provider = new firebase.auth.FacebookAuthProvider();
        firebase.auth().signInWithRedirect(provider);
    }
    
    showModalLoginWindowDisplay(){
        this.setState({
               visible : true
        });
    }
    
    handleCartDelete(cartItemKey) {
        this.databaseRef.child(cartItemKey).remove();
        message.success("Item Removed from Cart.");
    }
    
    handleCartQuantityChange(cartItemKey, newVal){
        this.databaseRef.child(cartItemKey).update({
           quantity: newVal 
        });
    }
    
    
    
    renderNewItem(props){
        return(
            <NewItem loggedInProp = {this.state.loggedIn} routeProps = {props}
            showModalLoginWindow= {this.showModalLoginWindowDisplay}
            loggedInUser = {this.state.currentUser}/>
        );
    }
    
    renderApp(props){
        return(
            <App loggedInProp = {this.state.loggedIn} routeProps = {props}
            showModalLoginWindow= {this.showModalLoginWindowDisplay}
            loggedInUser = {this.state.currentUser}/>
        );
    }
    
    handleCheckOut(){
        this.setState({
            cartVisible: false,
            order: true 
        });
    }
    
    handleSubmit(event){
        event.preventDefault();
        console.log('handleSubmit block');
        let newOrder = {
            address : event.target.address.value,
            items: this.state.cartItems
        } 
        
        let newOrderKey = this.databaseRef2.push().key;
        let newOrderPushed = {};
        
        newOrderPushed[''+this.state.currentUser.uid+'/'+newOrderKey] = newOrder;
        this.databaseRef2.update(newOrderPushed).then(this.handleOrderSuccess).catch(this.handleOrderFail);
        Object.keys(this.state.cartItems).map((cartItemKey) =>{
            this.databaseRef.child(cartItemKey).remove();
            
        });
        this.setState({
            order: false
        })
    }
    
    handleOrderSuccess(){
        console.log("Order Placed");
        notification.success({
            message: 'Order Placed',
            description: 'You may get the products very soon'
         });
    }
    handleOrderFail(){
        console.log("failed");
    }
    
    
    
    componentWillUnmount() {
        this.databaseRef.off();
    }
    
    
    getCartContent(){
         if(this.state.cartItemCount == 0) {
             return(<div>No items in the cart</div>);
         }else{
               return Object.keys(this.state.cartItems).map((cartItemKey) =>{
                   
                   let price=this.state.cartItems[cartItemKey].price;
                   let discount = this.state.cartItems[cartItemKey].discount;
                   let finalPrice = price-price*discount/100;
                   
                   return(
                    <Row>
                        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                            {this.state.cartItems[cartItemKey].title}
                        </Col>
                        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                            Quantity: 
                            <InputNumber min={1}
                            onChange = {(newVal)=>{this.handleCartQuantityChange(cartItemKey,newVal)}}
                            defaultValue={this.state.cartItems[cartItemKey].quantity}/>
                        </Col>
                        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                            Price: {finalPrice*this.state.cartItems[cartItemKey].quantity}
                        </Col>
                        <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                                <Button onClick={()=>{this.handleCartDelete(cartItemKey)}}
                            type="danger">Delete</Button>
                        </Col>
                        <br/>
                         <br /><br />
                        <hr />
                        <br />
                    </Row>
                   )
               });
         }
    }
    render(){
        let signInText = 'SignIn/Register';
        if (this.state.loggedIn == true){
            signInText = 'Logout'
        }
        let cartContent = this.getCartContent();
       return (
       <BrowserRouter>
            <div>
                <Layout>
                      <Sider breakpoint="md" collapsedWidth="0" style={{ background: '#fff'}}>
                            <Menu style={{ marginTop: '64px' }} theme="light" mode="inline"
                            defaultSelectedKeys={['1']}
                            onClick = {this.handleSiderMenuClick}
                            >
                              <Menu.Item key="1">
                                <Icon type="user" />
                                <span className="nav-text">
                                    My Account
                                </span>
                              </Menu.Item>
                              <Menu.Item key="2">
                                <Icon type="to-top" />
                                <span className="nav-text">
                                    <Link to='/new-item'>Upload Item</Link>
                                </span>
                              </Menu.Item>
                               <Menu.Item key="3">
                                <Icon type="key" />
                                <span className="nav-text">
                                   {signInText}
                                </span>
                              </Menu.Item>
                            </Menu>
                     </Sider>
                      <Layout>
                        <Header style={{lineHeight: '64px', background: '#fff'}}>
                             <Menu theme="light" mode="horizontal" 
                             onClick = {this.handleHeaderMenuClick}
                             defaultSelectedKeys={['1']} style={{float: 'right'}}>
                             <Menu.Item>
                                <img src={street} height="50px" width=""/>
                             </Menu.Item>
                             <Menu.Item key="1">
                                <Icon type="shopping-cart" />
                                <Badge count={this.state.cartItemCount}/>
                                <span className="nav-text">Cart</span>
                              </Menu.Item>
                            </Menu>
                        </Header>
                        <Content style={{margin: "15px"}}>
                            <Route exact path='/new-item' render={this.renderNewItem} />
                            <Route exact path='/' component={this.renderApp} />
                         </Content>
                        <Footer style={{background: '#fff'}}>
                            <p>2017&copy;All Rights Reserved.</p>
                        </Footer>
                      </Layout>
                    </Layout>
                    <Modal title="Login"
                      visible={this.state.visible}
                      onCancel={this.handleCancel}
                      footer={null} width='400px'>
                        <Button type="primary" style={{width: '100%', background: 'red'}} 
                            onClick={this.handleGoogleLogin}>
                        Login with Google</Button>
                        <br/><br/>
                        <Button type="primary" 
                        onClick={this.handleFBLogin}
                        style={{width: '100%', background: 'blue'}}>
                        Login with Facebook</Button>
                    </Modal>
                     <Modal title="Cart"
                          visible={this.state.cartVisible}
                          onCancel={this.handleCancel}
                          footer={null} width='90%'>
                            {cartContent}
                            <div>
                            <Button type="primary" onClick={this.handleCheckOut}>CheckOut</Button>
                            </div>
                    </Modal>
                     <Modal title="order"
                      visible={this.state.order}
                      onCancel={this.handleCancel}
                      footer={null} width='90%'>
                      {cartContent}
                      <div>
                        <form onSubmit={this.handleSubmit}>
                            <Input type="textarea" rows={2} placeholder="Address" name="address" /><br /><br/>
                            <Button type="primary" htmlType="submit">Place Order</Button>
                        </form>
                        </div>
                    </Modal>
            </div>
        </BrowserRouter>);
    }
}

export default MyRouts;
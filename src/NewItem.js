/*eslint-disable*/
import React, { Component } from 'react';
import { Input, InputNumber, Button, notification } from 'antd';
import * as firebase from 'firebase';


class NewItem extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            loading: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDBSaveSuccess = this.handleDBSaveSuccess.bind(this);
        this.handleLoginButton = this.handleLoginButton.bind(this);
    }
     
    componentDidMount(){
        this.databaseRef = firebase.database().ref('items');
    }
    
    componentWillUnmount() {
        this.databaseRef.off();
    }
    
    handleDBSaveSuccess(){
        console.log("Success");
        notification.success({
            message: 'Successfully added an item',
            description: 'Redirecting to the page which contains list'
         });
         this.props.routeProps.history.push('/');
    }
    
    handleDBSaveFail(){
        console.log("Failed");
        notification.error({
        message: "Can't add the item",
        description: 'Please try again'
      });
    }
    
    handleSubmit(event){
        event.preventDefault();
        console.log(event.target.title.value);
        
        let newItemKey = this.databaseRef.push().key;
        
        let imagePath = 'images/'+newItemKey+"/"+event.target.image.files[0].name;
        
        let newItem={
            title: event.target.title.value,
            desciption: event.target.description.value,
            image: imagePath,
            Rating: event.target.rating.value,
            discount: event.target.discount.value,
            price: event.target.price.value,
            createdBy: this.props.loggedInUser.uid,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        }
        

        
        let storageRef = firebase.storage().ref();
        
        
        
        console.log(newItemKey);
        let newItemPushed = {};
        newItemPushed[''+newItemKey] = newItem;
        console.log(newItemPushed);
        console.log(newItem);
        this.setState({
            loading: true
        });
        storageRef.child(imagePath).put(event.target.image.files[0])
        this.databaseRef.update(newItemPushed).then(this.handleDBSaveSuccess).catch(this.handleDBSaveFail);
    }
    
    handleLoginButton(){
        this.props.showModalLoginWindow();
    }

   
    render(){
      if(this.props.loggedInProp == true){
          return (
          <div>
            <h3>Add Item to be sold</h3>
            <hr/><br/>
            <form onSubmit={this.handleSubmit}>
                <Input placeholder="Item title" name="title" /><br/><br/>
                
                <input placeholder="Image" name="image" type="file"/><br/><br/>
                
                <Input style={{height: '60px'}}
                    placeholder="Desciption" name="description" /><br/><br/>
                <Input placeholder="EMI" name="EMI"/><br/><br/>
                
                <span>Price:</span><InputNumber placeholder="Price"
                name="price" defaultValue={50}/>
                
                <span>Rating:</span><InputNumber placeholder="Rating" 
                name="rating" defaultValue={3}/>
                
                <span>Discount:</span><InputNumber placeholder="Discount" 
                name="discount" defaultValue={0}/>
                <br/><br />
                <Button type="primary" htmlType="submit" loading={this.state.loading}>Add Item</Button>
            </form>
          </div>);
         }else{
             return(
             <div>
                <Button type="primary" onClick={this.handleLoginButton}>Log In</Button>
             </div>
             );
         }


    }
}

export default NewItem;
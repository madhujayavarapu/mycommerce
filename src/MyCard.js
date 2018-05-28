/*eslint-disable*/
import React, { Component } from 'react';
import './MyCard.css';
import { Card, Row, Col, Button, Badge, 
        Collapse, notification, Icon, Rate} from 'antd';
import * as firebase from 'firebase';

const Panel = Collapse.Panel;

class MyCard extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            imagePath : ''
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleImagePathDownload = this.handleImagePathDownload.bind(this);
    }
    addCartSuccess(){
        notification.success({
            message: 'Successfully added Item to Cart!',
            description: 'Go ahead and shop more.'
         });
    }
    
    
    handleClick(){
        
        if(this.props.loggedInProp != true){
            notification.error({
                message: 'Please Login',
                description: 'To add to cart, please login'
              });
              this.props.showModalLoginWindow();
        }
        else{
            let newCartItem={
                        title: this.props.passedItem.title,
                        price: this.props.passedItem.price,
                        quantity: 1,
                        discount: this.props.passedItem.discount
                    }
            let newItemPushed = {};
            
            newItemPushed[''+this.props.loggedInUser.uid+'/'+this.props.itemId] = newCartItem;
            this.databaseRef.update(newItemPushed).then(this.addCartSuccess);
        }
      
    }
    handleImagePathDownload(url){
        console.log(url);
        this.setState({
           imagePath: url 
        });
    }
    
    componentDidMount(){
        let storage = firebase.storage();
        let imageRef = storage.ref(this.props.passedItem.image);
        imageRef.getDownloadURL().then(this.handleImagePathDownload);
        
        
        this.databaseRef = firebase.database().ref('cart');
    }
    
    componentWillUnmount() {
        this.databaseRef.off();
    }
   
    
  render() {
    return (
        <Card title={this.props.passedItem.title} 
        extra={<Badge count={this.props.passedItem.discount+"% Off"}></Badge>}
        style={{margin: "4px"}}
        bodyStyle={{ padding: "10px" }}>
            <div className="custom-image">
              <img alt="example" width="100%" height="300" 
              src={this.state.imagePath} />
            </div>
            <div className="custom-card">
              <Collapse>
                <Panel header="Description" key="1">
                  <h3>{this.props.passedItem.desciption}</h3>
                </Panel>
               </Collapse>
              <hr/>
              <br/>
              <Row>
                <Col xs={12} >
                    <h4>Price: {this.props.passedItem.price}&nbsp;&nbsp;INR.</h4>
                </Col>
                <Col xs={12}>
                    <Button type="primary" 
                    onClick={this.handleClick} icon="shopping-cart" 
                    size="large">Add To Cart</Button>
                </Col>
              </Row>
            </div>
         </Card>
    );
  }
}

export default MyCard;

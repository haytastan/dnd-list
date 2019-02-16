import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ShapeScreen from './ShapeScreen'
import LinkedListScreen from './LinkedListScreen'
import SYMBOLS from '../constants/symbols'
import MessageScreen from './MessageScreen'
import ShapeCountModal from './ShapeCountModal'
import SlidingInput from 'sliding-input'

const getItems = (count, offset = 0) =>
    Array.from({ length: count }, (v, k) => k).map(k => ({
        id: `i${k + offset}`,
        content: `${SYMBOLS[k]} i${k + offset}`
    }));

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
};

const grid = 8;
const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 auto 3px auto`,
    width: '70px',
    background: isDragging ? 'lightgreen' : 'grey',
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    margin: ' 0 auto',
    minHeight: 400
});

const modalStyle = {
	overlay: {
		backgroundColor: "rgba(0, 0, 0,0.5)"
	}
};

const mainStyle = {
	app: {
		// margin: "120px 0"
	},
	button: {
		backgroundColor: "#408cec",
		border: 0,
		padding: "12px 20px",
		color: "#fff",
		margin: "0 auto",
		// width: 150,
		display: "block",
		borderRadius: 3
	}
};

class MainScreen extends Component{
    state = {
        items: [],
        selected: [],
        messages: [],
        toastOpen: false,
        toastMessage: '',
        isModalOpen: false,
        isInnerModalOpen: false,
        shapeCount: 1
    };
    id2List = {
        droppable: 'items',
        droppable2: 'selected'
    };
    getList = id => this.state[this.id2List[id]];
    onDragEnd = result => {
        const { source, destination, draggableId } = result;
        const { selected } = this.state

        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const items = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let state = { items };

            if (source.droppableId === 'droppable2') {
                state = { selected: items };
            }

            this.setState(state);
        } else {
            console.log("itemsss", this.state.items)
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );
            this.setState({
                items: result.droppable,
                selected: result.droppable2
            });
            if(destination.droppableId === 'droppable2'){
                let message = ''
                if((selected.length === 0))
                {
                    message = `${draggableId} added top of the list`
                }else if(typeof result.droppable2[destination.index-1] === "undefined"){
                    message = `${draggableId} added top of the list`
                }
                else{
                    message = `${draggableId} added after ${result.droppable2[destination.index-1]['id']}`
                }
                const newMessage = [...this.state.messages, message]
                this.setState({
                    messages: newMessage,
                    toastMessage: message,
                    toastOpen: true
                })
                setTimeout(
                    function() {
                        this.setState({toastOpen: false});
                    }
                    .bind(this),
                    3000
                );
            }
        }
    }
    handleTrash(sourceIndex, item){
        var source = { index: sourceIndex, droppableId: 'droppable2'}
        var destination = { droppableId: 'droppable', index: 0 }
        const result = move(
            this.state.selected,
            this.state.items,
            source,
            destination
        );
        let message = `${item['id']} removed the list`
        const newMessage = [...this.state.messages, message]
        this.setState({
            items: result.droppable,
            selected: result.droppable2,
            messages: newMessage,
            toastMessage: message,
            toastOpen: true
        });
        setTimeout(
            function() {
                this.setState({toastOpen: false});
            }
            .bind(this),
            3000
        );
    }
    closeModal = () => {
        const { shapeCount } = this.state
		this.setState({
            isModalOpen: false,
            items: getItems(shapeCount),
            selected: getItems(0, shapeCount),
		});
    }
    componentDidMount(){
        this.openModal()
    }

	openModal = () => {
		this.setState({
			isModalOpen: true
		});
    }
    handleInputValue = (value) => {
        this.setState({
            shapeCount: value
        })
    }
    render(){
        const { messages, toastOpen, toastMessage } = this.state
        return(
            <div>
            <div className="wrapper">
            <DragDropContext onDragEnd={this.onDragEnd}>
                <div className='linked-list_screen'>
                <Droppable droppableId="droppable2">
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}>
                            {this.state.selected.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id}
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <div>
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}>
                                                <span style={{textAlign: 'center', display: 'block'}}>{item.content}</span>
                                                <br/>
                                                <span  onClick={() => this.handleTrash(index, item)} className="delete">🗑️</span>
                                            </div>
                                            <div id="arrow">🠻</div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
                </div>
                <div className="shape_screen">
                    <Droppable droppableId="droppable">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                style={getListStyle(snapshot.isDraggingOver)}>
                                {this.state.items.map((item, index) => (
                                    <Draggable
                                        key={item.id}
                                        draggableId={item.id}
                                        index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}>
                                                {item.content}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>
            </div>
            {
                toastOpen &&
                <div id='snackbar'>{toastMessage}</div>
            }
            <MessageScreen messages={messages}/>
            <div style={mainStyle.app}>
				<ShapeCountModal
					isModalOpen={this.state.isModalOpen}
					closeModal={this.closeModal}
					style={modalStyle}
				>
                <span>How many shapes do you want to create?</span>
                <br/>
                <SlidingInput min={1} max={25} defaultValue={15} value={1} onChange={this.handleInputValue}/>
					<button
						style={{
							...mainStyle.button,
							margin: 0,
							width: "auto",
							marginTop: 10
						}}
						onClick={this.closeModal}
					>
						Save
					</button>
				</ShapeCountModal>
			</div>
            </div>
        )
    }
}

export default MainScreen;
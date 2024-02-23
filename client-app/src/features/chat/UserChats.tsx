import { observer } from "mobx-react-lite";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import { Grid, Header, Loader, Segment, Tab } from "semantic-ui-react";
import { PagingParams } from "../../app/models/pagination";
import { useStore } from "../../app/stores/Store";
import ChatCard from "./ChatCard";

export default observer(function UserChats() {
    const { conversationStore: { conversations, send, paginationConversation, setPagingParamsConversation, listConversations, loadingConversations } } = useStore();
    //const [containerHeight, setContainerHeight] = useState(0);

    const customStyle: React.CSSProperties = {
        padding: '5px', // Adjust the value as needed
    };


    const Column = ({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={{ ...style, ...customStyle, display: 'flex', alignItems: 'center' }} key={index}>
            <ChatCard conversation={conversations[index]} send={send} />
            {loadingConversations && index === conversations.length - 1 && (
                <Loader content='       ' active inline size='small' style={{ marginleft: '5px !important' }} />
            )}
        </div>
    );


    //useEffect(() => {
    //    const cardsContainer = document.getElementById('cards-container');
    //    const totalHeight = (cardsContainer) ? cardsContainer.scrollHeight + 30 : 0;
    //    setContainerHeight(totalHeight);
    //}, [conversations]);

    function CanLoadMore(): boolean {
        return !!paginationConversation && paginationConversation.currentPage < paginationConversation.totalPages;
    }

    const loadMore = () => {
        if (CanLoadMore()) {
            setPagingParamsConversation(new PagingParams(paginationConversation!.currentPage + 1, 10));
            listConversations();
        }
    };

    return (
        <Tab.Pane>
            <Segment>
                <Grid>
                    <Header floated='left' icon='chat' content='Chats' style={{ marginTop: '5px', marginBottom: '2px' }} />
                    <Grid.Column width={16}>
                        {/*<div*/}
                        {/*    id="cards-container"*/}
                        {/*    style={{*/}
                        {/*        overflowX: 'auto',*/}
                        {/*        height: `${containerHeight}px`,*/}
                        {/*        display: 'flex',*/}
                        {/*        flexWrap: 'nowrap',*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    {conversations.map(conversation => (*/}
                        {/*        <div*/}
                        {/*            key={conversation.conversationId}*/}
                        {/*            style={{*/}
                        {/*                padding: '5px'*/}
                        {/*            }}*/}
                        {/*        >*/}
                        {/*            <ChatCard conversation={conversation} send={send} />*/}
                        {/*        </div>*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                        <div style={{ width: '100%', height: '230px' }} id='cards-container'>
                            <AutoSizer>
                                {({ width, height }: { width: number, height: number }) => (
                                    <FixedSizeList
                                        height={height}
                                        itemCount={conversations.length}
                                        itemSize={295}
                                        layout="horizontal"
                                        width={width}
                                        onItemsRendered={({ visibleStopIndex }) => {
                                            if (visibleStopIndex === conversations.length - 1) {
                                                loadMore();
                                            }
                                        }}
                                    >
                                        {Column}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </div>
                    </Grid.Column>

                </Grid>
            </Segment>
        </Tab.Pane>
    )
})
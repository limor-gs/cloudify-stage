/**
 * Created by kinneretzin on 20/10/2016.
 */

export default class EventsTable extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.widget !== nextProps.widget
            || this.state != nextState
            || !_.isEqual(this.props.data, nextProps.data);
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('events:refresh', this._refreshData, this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('events:refresh', this._refreshData);
    }

    fetchGridData(fetchParams) {
        this.props.toolbox.refresh(fetchParams);
    }

    _selectEvent(eventId) {
        let selectedEventId = this.props.toolbox.getContext().getValue('eventId');
        this.props.toolbox.getContext().setValue('eventId', eventId === selectedEventId ? null : eventId);
    }

    render() {
        let {ErrorMessage, DataTable, Popup, HighlightText} = Stage.Basic;

        return (
            <div>
                <ErrorMessage error={this.state.error}/>

                <DataTable fetchData={this.fetchGridData.bind(this)}
                           totalSize={this.props.data.total}
                           pageSize={this.props.widget.configuration.pageSize}
                           sortColumn={this.props.widget.configuration.sortColumn}
                           sortAscending={this.props.widget.configuration.sortAscending}
                           className="eventsTable">

                    <DataTable.Column label="Blueprint" name="context.blueprint_id" width="10%" show={!this.props.data.blueprintId &&
                                                                                                      !this.props.data.deploymentId &&
                                                                                                      !this.props.data.executionId} />
                    <DataTable.Column label="Deployment" name="context.deployment_id" width="10%" show={!this.props.data.deploymentId && !this.props.data.executionId} />
                    <DataTable.Column label="Workflow" name="context.workflow_id" width="10%" show={!this.props.data.executionId} />
                    <DataTable.Column label="Event Type" name="event_type" width={this.props.widget.configuration.showLogs ? '10%': '20%'}/>
                    <DataTable.Column label="Log Level" name="level" width="10%" show={this.props.widget.configuration.showLogs}/>
                    <DataTable.Column label="Timestamp" name="timestamp" width="10%"/>
                    <DataTable.Column label="Operation" name="context.operation" width="10%"/>
                    <DataTable.Column label="Node Name" name="context.node_name" width="10%"/>
                    <DataTable.Column label="Node Id" name="context.node_id" width="10%"/>
                    <DataTable.Column label="Message" name="message.text" width="10%"/>

                    {
                        this.props.data.items.map((item) => {
                            return (
                                <DataTable.Row key={item.id} selected={item.isSelected} onClick={this._selectEvent.bind(this, item.id)}>
                                    <DataTable.Data>{item.context.blueprint_id}</DataTable.Data>
                                    <DataTable.Data>{item.context.deployment_id}</DataTable.Data>
                                    <DataTable.Data>{item.context.workflow_id}</DataTable.Data>
                                    <DataTable.Data>{item.event_type}</DataTable.Data>
                                    <DataTable.Data>{item.level}</DataTable.Data>
                                    <DataTable.Data>{item.timestamp}</DataTable.Data>
                                    <DataTable.Data>{item.context.operation}</DataTable.Data>
                                    <DataTable.Data>{item.context.node_name}</DataTable.Data>
                                    <DataTable.Data>{item.context.node_id}</DataTable.Data>
                                    <DataTable.Data>
                                        {item.message.text &&
                                            <Popup position='top left' wide>
                                                <Popup.Trigger><span>{item.message.text}</span></Popup.Trigger>
                                                <HighlightText>{item.message.text}</HighlightText>
                                            </Popup>
                                        }
                                    </DataTable.Data>
                                </DataTable.Row>
                            );
                        })
                    }
                </DataTable>
            </div>
        );
    }
}

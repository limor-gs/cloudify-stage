/**
 * Created by kinneretzin on 18/10/2016.
 */

import MenuAction from './MenuAction';
import DeploymentsSegment from './DeploymentsSegment';
import DeploymentsTable from './DeploymentsTable';

export default class extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
            error: null,
            modalType: '',
            showModal: false,
            deployment: {},
            workflow: {}
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.data, nextProps.data);
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('deployments:refresh',this._refreshData,this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('deployments:refresh',this._refreshData);
    }

    _selectDeployment(item) {
        if (this.props.widget.configuration.clickToDrillDown) {
            this.props.toolbox.drillDown(this.props.widget,'deployment',{deploymentId: item.id}, item.id);
        } else {
            var oldSelectedDeploymentId = this.props.toolbox.getContext().getValue('deploymentId');
            this.props.toolbox.getContext().setValue('deploymentId',item.id === oldSelectedDeploymentId ? null : item.id);
        }
    }

    _deleteDeployment() {
        this._hideModal();

        if (!this.state.deployment) {
            this._setError('Something went wrong, no deployment was selected for delete');
            return;
        }

        this.props.toolbox.loading(true);

        var actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        actions.doDelete(this.state.deployment).then(() => {
            this._setError(null);
            this.props.toolbox.getEventBus().trigger('deployments:refresh');
            this.props.toolbox.loading(false);
        }).catch((err) => {
            this._setError(err.message);
            this.props.toolbox.loading(false);
        });
    }

    _forceDeleteDeployment() {
        this._hideModal();

        if (!this.state.deployment) {
            this._setError('Something went wrong, no deployment was selected for delete');
            return;
        }

        this.props.toolbox.loading(true);

        var actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        actions.doForceDelete(this.state.deployment).then(() => {
            this._setError(null);
            this.props.toolbox.getEventBus().trigger('deployments:refresh');
            this.props.toolbox.loading(false);
        }).catch((err) => {
            this._setError(err.message);
            this.props.toolbox.loading(false);
        });
    }

    _cancelExecution(execution, action) {
        let actions = new Stage.Common.ExecutionActions(this.props.toolbox);
        actions.doCancel(execution, action).then(() => {
            this._setError(null);
            this.props.toolbox.getEventBus().trigger('deployments:refresh');
            this.props.toolbox.getEventBus().trigger('executions:refresh');
        }).catch((err) => {
            this._setError(err.message);
        });
    }

    _setDeploymentVisibility(deploymentId, visibility) {
        var actions = new Stage.Common.DeploymentActions(this.props.toolbox);
        this.props.toolbox.loading(true);
        actions.doSetVisibility(deploymentId, visibility)
            .then(()=> {
                this.props.toolbox.loading(false);
                this.props.toolbox.refresh();
            })
            .catch((err)=>{
                this.props.toolbox.loading(false);
                this.setState({error: err.message});
            });
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    _showModal(value, deployment, workflow) {
        this.setState({deployment, workflow:workflow?workflow:{},
                       modalType: workflow?MenuAction.WORKFLOW_ACTION:value, showModal: true});
    }

    _hideModal() {
        this.setState({showModal: false});
    }

    _setError(errorMessage) {
        this.setState({error: errorMessage});
    }

    fetchData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }

    render() {
        const NO_DATA_MESSAGE = 'There are no Deployments available. Click "Create deployment" to add deployments.';
        let {ErrorMessage, Confirm} = Stage.Basic;
        let {ExecuteDeploymentModal, UpdateDeploymentModal} = Stage.Common;
        let showTableComponent = this.props.widget.configuration['displayStyle'] === 'table';

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                {showTableComponent ?
                    <DeploymentsTable widget={this.props.widget} data={this.props.data}
                                      fetchData={this.fetchData.bind(this)}
                                      onSelectDeployment={this._selectDeployment.bind(this)}
                                      onMenuAction={this._showModal.bind(this)}
                                      onCancelExecution={this._cancelExecution.bind(this)}
                                      onError={this._setError.bind(this)}
                                      onSetVisibility={this._setDeploymentVisibility.bind(this)}
                                      allowedSettingTo={['tenant']}
                                      noDataMessage={NO_DATA_MESSAGE}/>
                    :
                    <DeploymentsSegment widget={this.props.widget} data={this.props.data}
                                        fetchData={this.fetchData.bind(this)}
                                        onSelectDeployment={this._selectDeployment.bind(this)}
                                        onMenuAction={this._showModal.bind(this)}
                                        onCancelExecution={this._cancelExecution.bind(this)}
                                        onError={this._setError.bind(this)}
                                        onSetVisibility={this._setDeploymentVisibility.bind(this)}
                                        allowedSettingTo={['tenant']}
                                        noDataMessage={NO_DATA_MESSAGE}/>
                }

                <Confirm content={`Are you sure you want to remove deployment ${this.state.deployment.id}?`}
                         open={this.state.modalType === MenuAction.DELETE_ACTION && this.state.showModal}
                         onConfirm={this._deleteDeployment.bind(this)}
                         onCancel={this._hideModal.bind(this)} />

                <Confirm content={`Its recommended to first run uninstall to stop the live nodes, and then run delete.
                                   Force delete will ignore any existing live nodes.
                                   Are you sure you want to ignore the live nodes and delete the deployment ${this.state.deployment.id}?`}
                         open={this.state.modalType === MenuAction.FORCE_DELETE_ACTION && this.state.showModal}
                         onConfirm={this._forceDeleteDeployment.bind(this)}
                         onCancel={this._hideModal.bind(this)} />

                <ExecuteDeploymentModal
                    open={this.state.modalType === MenuAction.WORKFLOW_ACTION && this.state.showModal}
                    deployment={this.state.deployment}
                    workflow={this.state.workflow}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}/>

                <UpdateDeploymentModal
                    open={this.state.modalType === MenuAction.UPDATE_ACTION && this.state.showModal}
                    deployment={this.state.deployment}
                    onHide={this._hideModal.bind(this)}
                    toolbox={this.props.toolbox}/>
            </div>

        );
    }
}

import React from 'react';
import flow from 'lodash/flow';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// Ui
import { withStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

// Actions
import { getUsers } from '../../action/users';

// components
import Table from '../table';
import EditUser from '../edit-user';


const useStyles = {
    wrapper: {
        width: '100%',
        position: 'inherit',
    },
    tools: {
        padding: '10px 0 0 10px',
    },
};

class Users extends React.Component {
    state= {
        drawerIsOpen: false,
    }

    constructor(props) {
        super();
        props.getUsers();
    }

    editHandler = (userId) => {
        this.setState({
            drawerIsOpen: true,
            editUserId: userId,
        });
    };

    addUser = () => {
        this.setState({
            drawerIsOpen: true,
            editUserId: '',
        });
    };

    render() {
        const {
            classes,
        } = this.props;
        return (
            <div className={classes.wrapper}>
                <Grid item xs={12} className={classes.tools}>
                    <Fab color="primary" aria-label="Add" onClick={this.addUser.bind(this)}>
                        <AddIcon />
                    </Fab>

                </Grid>
                <Grid item xs={12}>
                    <EditUser
                        side={'right'}
                        open={this.state.drawerIsOpen}
                        userId={this.state.editUserId}
                        onClose={() => {
                            this.setState({
                                drawerIsOpen: false,
                            });
                        }}
                    />
                    <Table data={this.props.users.all} editHandler={this.editHandler} type='user'/>
                </Grid>

            </div>
        );
    }
}

const mapStateToProps = state => ({
    users: state.users,
});
const mapDispatchToProps = dispatch => bindActionCreators({
    getUsers,
}, dispatch);

export default flow(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withStyles(useStyles),
)(Users);
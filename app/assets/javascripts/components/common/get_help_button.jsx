import React from 'react';
import Expandable from '../high_order/expandable.cjsx';
import UserStore from '../../stores/user_store.coffee';
import AlertsStore from '../../stores/alerts_store.coffee';
import AlertActions from '../../actions/alert_actions.js';

const getState = () =>
  ({
    contentExperts: UserStore.getFiltered({ content_expert: true }),
    programManagers: UserStore.getFiltered({ program_manager: true }),
    alertSubmitting: AlertsStore.getNeedHelpAlertSubmitting(),
    alertCreated: AlertsStore.getNeedHelpAlertSubmitted()
  })
;

const GetHelpButton = React.createClass({
  displayName: 'GetHelpButton',

  propTypes: {
    key: React.PropTypes.string,
    current_user: React.PropTypes.object,
    open: React.PropTypes.func,
    is_open: React.PropTypes.bool
  },

  mixins: [UserStore.mixin, AlertsStore.mixin],

  getInitialState() {
    return Object.assign(getState(), {
      selectedHelper: null,
      message: null
    });
  },

  getKey() {
    return this.props.key;
  },

  stop(e) {
    return e.stopPropagation();
  },

  storeDidChange() {
    return this.setState(getState());
  },

  reset(e) {
    e.preventDefault();
    this.setState({
      message: '',
      selectedHelper: null
    });
    this.props.open();
    setTimeout(() => {
      AlertActions.resetNeedHelpAlert();
    }, 500);
  },

  updateHelper(helper, e) {
    e.preventDefault();
    this.setState({ selectedHelper: helper });
  },

  clearHelper(e) {
    e.preventDefault();
    this.setState({ selectedHelper: null });
  },

  updateMessage(e) {
    this.setState({ message: e.target.value });
  },

  submitNeedHelpMessage(e) {
    e.preventDefault();
    const messageData = {
      target_user_id: this.state.selectedHelper.id,
      message: this.state.message
    };
    AlertActions.submitNeedHelpAlert(messageData);
  },

  render() {
    let programManagers;
    let contentExperts;
    let helpers;
    let content;

    contentExperts = this.state.contentExperts.map((user) => {
      return (
        <span className="content-experts" key={user.username}>
          <a href="#" data-helper-id={user.id} onClick={(e) => this.updateHelper(user, e)}>{user.username}</a> (Content Expert)
          <br />
        </span>
      );
    });

    if (this.props.current_user.role > 0) {
      programManagers = this.state.programManagers.map((user) => {
        return (
          <span className="program-managers" key={user.username}>
            <a href="#" data-helper-id={user.id} onClick={(e) => this.updateHelper(user, e)}>{user.username}</a> (Program Manager)
            <br />
          </span>
        );
      });
    }

    if (programManagers || contentExperts) {
      helpers = (
        <p className="helpers">
          If you still need help, reach out to your Wikipedia Content Expert:
          <br />
          {contentExperts}
          {programManagers}
        </p>
      );
    }

    if (this.state.alertSubmitting) {
      content = (
        <div className="text-center">
          <strong>Message submitting</strong>
        </div>
      );
    } else if (this.state.alertCreated) {
      content = (
        <div className="text-center">
          <strong>
            Message submitted! <a href="#" onClick={this.reset}>Ok</a>
          </strong>
        </div>
      );
    } else if (this.state.selectedHelper) {
      content = (
        <div>
          <p><strong>To: {this.state.selectedHelper.username}</strong></p>
          <form onSubmit={this.submitNeedHelpMessage} className="mb0">
            <input name="helper" type="hidden" defaultValue="" value={this.state.selectedHelper.id} />
            <fieldset>
              <label htmlFor="message" className="input-wrapper">
                <span>Your Message:</span>
                <textarea name="message" className="mb1" onChange={this.updateMessage} defaultValue="" value={this.state.message} />
              </label>
            </fieldset>
            <button className="button dark ml0" value="Submit">Send</button>
            <button className="button" onClick={this.clearHelper}>Cancel</button>
          </form>
        </div>
      );
    } else {
      content = (
        <div>
          <p>
            <strong>
              Hi, if you need help with your Wikipedia assignment, you've come
              to the right place!
            </strong>
          </p>

          <form target="_blank" action="/ask" acceptCharset="UTF-8" method="get">
            <input name="utf8" type="hidden" defaultValue="✓" />
            <input type="text" name="q" id="q" defaultValue="" placeholder="Search Help Forum" />
            <button type="submit">
              <i className="icon icon-search"></i>
            </button>
          </form>

          <p>
            You may also refer to our interactive training modules and
            external resources for help with your assignment.
          </p>

          <p>
            <a href="/training" target="blank">Interactive Training</a><br />
            <a href="#" target="blank">FAQ</a>
          </p>

          {helpers}
        </div>
      );
    }

    return (
      <div className="pop__container">
        <button className="dark button small" onClick={this.props.open}>Get Help</button>
        <div className={`pop ${this.props.is_open ? ' open' : ''}`}>
          <div className="pop__padded-content">
            {content}
          </div>
        </div>
      </div>
    );
  }
});

export default Expandable(GetHelpButton);

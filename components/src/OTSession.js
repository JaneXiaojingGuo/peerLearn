import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';

import createSession from './createSession';

export default class OTSession extends Component {
  constructor(props) {
    super(props);

    this.state = {
      streams: [],
    };
  }

  componentWillMount() {
    this.createSession();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.apiKey !== this.props.apiKey ||
      prevProps.sessionId !== this.props.sessionId ||
      prevProps.token !== this.props.token
    ) {
      this.createSession();
    }
  }

  componentWillUnmount() {
    this.destroySession();
  }

  createSession() {
    this.destroySession();

    this.sessionHelper = createSession({
      apiKey: this.props.apiKey,
      sessionId: this.props.sessionId,
      token: this.props.token,
      onStreamsUpdated: (streams) => { this.setState({ streams }); },
      onConnect: this.props.onConnect,
      onError: this.props.onError,
    });

    if (
      this.props.eventHandlers &&
      typeof this.props.eventHandlers === 'object'
    ) {
      this.sessionHelper.session.on(this.props.eventHandlers);
    }

    const { streams } = this.sessionHelper;
    this.setState({ streams });
  }

  destroySession() {
    if (this.sessionHelper) {
      if (
        this.props.eventHandlers &&
        typeof this.props.eventHandlers === 'object'
      ) {
        this.sessionHelper.session.off(this.props.eventHandlers);
      }
      this.sessionHelper.disconnect();
    }
  }

  render() {
    const childrenWithProps = Children.map(
      this.props.children,
      child => (child ? cloneElement(
        child,
        {
          session: this.sessionHelper.session,
          streams: this.state.streams,
        },
      ) : child),
    );

    return <div className="video-call">{childrenWithProps}</div>;
  }
}

OTSession.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  apiKey: PropTypes.string.isRequired,
  sessionId: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  eventHandlers: PropTypes.objectOf(PropTypes.func),
  onConnect: PropTypes.func,
  onError: PropTypes.func,
};

OTSession.defaultProps = {
  eventHandlers: null,
  onConnect: null,
  onError: null,
};

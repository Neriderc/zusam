import { h, Component, Fragment } from "preact";
import { cache, http, util } from "/core";
import { Link, withRouter } from "react-router-dom";

class MessageBreadcrumbs extends Component {

  componentDidMount() {
    cache.fetch(`/api/messages/${this.props.id}`).then(m => {
      let stack = [];
      let parent = m?.parent;
      while (parent) {
        stack.push(parent);
        parent = parent?.parent;
      }
      stack.push(m.group);
      stack = stack.reverse();
      this.setState({stack});
    });
  }

  getTitle(message) {
      if (message && message['data']) {
        if (message['data']['title']) {
          return message['data']['title'];
        }
        if (message['data']['text']) {
          let url = util.getUrl(message['data']['text']);
          if (url && url.length > 0) {
            url = url[0];
          }
          if (url) {
            return url;
          }
          return message['data']['text'];
        }
      }
      return "";
  }

  render() {
    if (this.state?.stack) {
      return (
        <div class="message-breadcrumbs">
          <nav style="--bs-breadcrumb-divider: '>';">
            <ol class="breadcrumb">
              {[this.state.stack[0], ...this.state.stack.slice(Math.min(2, this.state.stack.length - 1) * -1)].map((e, i) => e && e.id && (
                <Fragment>
                  <Fragment>
                    {i == 1 && this.state.stack.length > 3 && (
                      <li class="breadcrumb-item">...</li>
                    )}
                  </Fragment>
                  <li class="breadcrumb-item">
                    <Link
                      key={e.id}
                      to={`/${e.entityType}s/${e.id}`}
                      class="no-decoration"
                    >{(e.entityType == "message" ? this.getTitle(e) : e?.name) || e.id}</Link>
                  </li>
                </Fragment>
              ))}
            </ol>
          </nav>
        </div>
      );
    }
    return null;
  }
}

export default withRouter(MessageBreadcrumbs);

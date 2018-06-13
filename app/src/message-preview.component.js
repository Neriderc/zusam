import { h, render, Component } from "preact";
import bee from "./bee.js";
import router from "./router.js";
import FaIcon from "./fa-icon.component.js";

export default class MessagePreview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: props.url,
        };
        bee.get(props.url.replace(/messages/, "message-previews")).then(
            msgp => {
                this.setState(Object.assign({}, msgp));
                bee.get("message_" + bee.getId(props.url)).then(
                    lastVisit => this.setState({
                        hasNews: !!lastVisit && lastVisit.timestamp < msgp.lastActivityDate
                    })
                );
            }
        );
    }

    getTitle() {
        if (!this.state.title || this.state.title.length < 30) {
            return this.state.title && " ";
        }
        return this.state.title.slice(0, 27) + "...";
    }

    render() {
        if (!this.state["@id"]) {
            return <a href={this.state.url} class="message-preview-placeholder material-shadow"></a>;
        }

        return (
            <a class="d-block seamless-link message-preview" href={router.toApp(this.state.url)} onClick={router.onClick}>
                <div class="card material-shadow">
                    { this.state.author && this.state.author.avatar && <img class="avatar material-shadow" src={ bee.crop(this.state.author.avatar, 100, 100) } /> }
                    { this.state.preview ?
                            <img class="card-img-top" src={ bee.crop(this.state.preview, 320, 180) } />
                            : (
                                <svg fill="#ccc" class="card-img-top" viewBox="0 0 320 180">
                                    <path d="M67,13.4v14.4h-7.5l-0.7-7.5H44.3v51.4l7.3,1.3v5.7H28.2v-5.7l7.3-1.3V20.4H20.9l-0.6,7.5h-7.6V13.4H67z"/>
                                    <rect x="76" y="14" width="78" height="11"/>
                                    <rect x="76" y="34" width="78" height="11"/>
                                    <rect x="76" y="54" width="78" height="11"/>
                                    <rect x="76" y="74" width="78" height="11"/>
                                    <rect x="12" y="94" width="141" height="11"/>
                                    <rect x="12" y="115" width="141" height="11"/>
                                    <rect x="12" y="135" width="141" height="11"/>
                                    <rect x="12" y="155" width="141" height="11"/>
                                    <rect x="168" y="14" width="141" height="11"/>
                                    <rect x="168" y="34" width="141" height="11"/>
                                    <rect x="168" y="54" width="141" height="11"/>
                                    <rect x="168" y="74" width="141" height="11"/>
                                    <rect x="168" y="94" width="141" height="72"/>
                                </svg>
                            )
                    }
                    <div class="card-body border-top d-flex justify-content-between">
                        <span class="left-buffer"></span>
                        <span class="title">{ this.getTitle() }</span>
                        <span className={"children" + (this.state.hasNews ? " text-warning" : "")}>
                            { !!this.state.children_count && (
                                <span>
                                    { this.state.children_count + " " }
                                    <FaIcon family={"regular"} icon={"comment"} />
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </a>
        );
    }
}

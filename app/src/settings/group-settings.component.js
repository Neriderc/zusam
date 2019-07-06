import { h, render, Component } from "preact";
import { me, alert, cache, http, router } from "/core";
import FaIcon from "../components/fa-icon.component.js";

export default class GroupSettings extends Component {

    constructor(props) {
        super(props);
        this.updateSettings = this.updateSettings.bind(this);
        this.leaveGroup = this.leaveGroup.bind(this);
        this.leave = this.leave.bind(this);
        this.resetSecretKey = this.resetSecretKey.bind(this);
        this.state = Object.assign({}, props);
    }

    resetSecretKey(event) {
        event.preventDefault();
        http.post("/api/groups/" + this.state.id + "/reset-invite-key", {}).then(res => {
            alert.add(lang["group_updated"]);
            cache.resetCache();
            this.setState({secretKey: res["inviteKey"]});
        });
    }

    updateSettings(event) {
        event.preventDefault();
        const name = document.querySelector("#settings_form input[name='name']").value;
        let group = {};
        if (name) {
            group.name = name;
        }
        http.put("/api/groups/" + this.state.id, group).then(res => {
            alert.add(lang["group_updated"]);
            cache.resetCache();
            this.setState(Object.assign(this.state, res));
        });
    }

    leaveGroup(event) {
        event.preventDefault();
        if (me.me.data["default_group"] == this.state.id) {
            let user = {};
            user.data = {"default_group": me.me.groups[0].id};
            http.put("/api/users/" + me.me.id, user).then(res => {
                me.update();
                this.leave();
            });
        } else {
            this.leave();
        }
    }

    leave() {
        http.post("/api/groups/" + this.state.id + "/leave", {}).then(res => {
            if (!res || !res["entityType"]) {
                alert.add(lang["error"]);
            } else {
                me.update();
                alert.add(lang["group_left"]);
                router.navigate("/");
            }
        })
    }

    render() {
        return (
            <div class="group-settings">
                <div class="card">
                    <div class="card-body">
                        <div class="container-fluid p-1">
                            <div class="row">
                                <div class="col-12 col-md-10">
                                    <form id="settings_form" class="mb-1 border-bottom pb-1">
                                        <div class="form-group">
                                            <label for="name">{lang["name"]}: </label>
                                            <input
                                                type="text"
                                                name="name"
                                                minlength="1"
                                                maxlength="128"
                                                placeholder={lang["name_input"]}
                                                value={this.state.name}
                                                class="form-control"
                                                required
                                            ></input>
                                        </div>
                                        <button onClick={this.updateSettings} class="btn btn-outline-secondary">{lang["save_changes"]}</button>
                                    </form>
                                    <form class="mb-1 border-bottom pb-1">
                                        <div class="form-group">
                                            <label for="inviteKey">{lang["invitation_link"]}: </label>
                                            <input
                                                type="text"
                                                name="inviteKey"
                                                value={
                                                    location.protocol
                                                        + "//" + location.hostname
                                                        + "/invitation/"
                                                        + this.state.secretKey
                                                }
                                                class="form-control font-size-80"
                                                readonly="readonly"
                                            ></input>
                                        </div>
                                        <button class="btn btn-outline-secondary" onClick={this.resetSecretKey}>
                                            {lang["reset_invitation_link"]}
                                        </button>
                                    </form>
                                    <form>
                                        <button onClick={this.leaveGroup} class="btn btn-outline-danger">{lang["quit_group"]}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

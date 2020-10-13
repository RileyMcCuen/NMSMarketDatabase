import React from 'react';
import './App.css';

// import data from './nms.json';

interface Item {
    name: string;
    price: number;
    percent: number;
}

const dataKeys = ["systems"];
const systemKeys = ["name", "glyphs", "tags", "buy", "sell"];
const itemKeys = ["name", "price", "percent"];

function verifyItem(item: any): boolean {
    return typeof item === 'object'
    && itemKeys.every(key => item.hasOwnProperty(key))
    && typeof item.name === 'string'
    && typeof item.price === 'number'
    && typeof item.percent === 'number';
}

function verifyItems(items: any[]): boolean {
    return items.every(verifyItem);
}

function verifySystem(system: any): boolean {
    if (typeof system === 'object'
        && systemKeys.every(key => (system as object).hasOwnProperty(key))
        && systemKeys.length === Object.keys(system).length
    ) {
        return verifyItems((system as SystemData).buy) && verifyItems((system as SystemData).sell);
    }
    return false;
}

function verifyData(data: any): boolean {
    console.log(data.systems)
    if (Array.isArray(data)) {
        return data.every(verifySystem);
    } else if (typeof data === 'object'
        && dataKeys.every(key => data.hasOwnProperty(key))
        && Array.isArray(data.systems)
    ) {
        return data.systems.every(verifySystem);
    }
    return false;
}

interface SystemData {
    name: string;
    glyphs: string;
    tags: string[];
    buy: Item[];
    sell: Item[];
}

interface SystemProps extends SystemData {
    displayBuy: boolean;
    displaySell: boolean;
    remove: (name: string) => any;
}

class System extends React.Component<SystemProps, {}> {

    list(items: Item[], buy: boolean): React.ReactNode {
        return (
            <ul className={"items"}>
                {
                    items.map((item, index) => {
                        return (
                            <li key={index} className={"item text"}>
                                <div className={"clear"}>
                                      <span className={"left"}>
                                          {item.name}
                                      </span>
                                    <span className={"right"}>
                                          &#x244;&nbsp; {item.price}
                                      </span>
                                </div>
                                <div className={"clear"}>
                                    <div className={"right"}>
                                        {buy ? item.percent > 0 ?
                                            [<span key={index + ":arrow"} className={"red bold"}> &uarr; </span>] :
                                            [<span key={index + ":arrow"} className={"green bold"}> &darr; </span>]
                                            : item.percent > 0 ?
                                                [<span key={index + ":arrow"}
                                                       className={"green bold"}> &uarr; </span>] :
                                                [<span key={index + ":arrow"} className={"red bold"}> &darr; </span>]
                                        }&nbsp;{Math.abs(item.percent)}&nbsp;%
                                    </div>
                                </div>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

    listBuy() {
        return this.list(this.props.buy, true)
    }

    listSell() {
        return this.list(this.props.sell, false)
    }

    render(): React.ReactNode {
        const buy = this.props.displayBuy ? this.listBuy() : null;
        const sell = this.props.displaySell ? this.listSell() : null;
        return (
            <div className={"system white"}>
                <h3 className={"title system-title"}>
                    {this.props.name}
                </h3>
                <button
                    className={"delete"}
                    title={"Delete"}
                    onClick={() => this.props.remove(this.props.name)}
                >
                    🗑
                </button>
                <hr className={"system-underline"}/>
                {buy}
                {sell}
            </div>
        );
    }

    static fromSystemData(systemData: SystemData, remove: (name: string) => any, displayBuy: boolean, displaySell: boolean, key: number | string) {
        return (
            ((displayBuy && systemData.buy.length > 0) || (displaySell && systemData.sell.length > 0)) ?
                <System
                    key={key}
                    remove={remove}
                    name={systemData.name}
                    displayBuy={displayBuy}
                    displaySell={displaySell}
                    glyphs={systemData.glyphs}
                    tags={systemData.tags}
                    buy={systemData.buy}
                    sell={systemData.sell}
                />
                : null
        );
    }

}

interface ListInputProps {
    title: string;
    item: { [key: string]: string };
    onAdd: () => (data: { [key: string]: string }) => any;
    onRemove: () => any;
}

interface ListInputState {
    count: number;
    onChanges: ((data: { [key: string]: string }) => any)[];
}

function HTMLValueConverter(type: string) {
    switch (type) {
        case "string":
            return (ev: React.ChangeEvent<HTMLInputElement>) => {
                return ev.target.value;
            }
        case "int":
            return (ev: React.ChangeEvent<HTMLInputElement>) => {
                return parseInt(ev.target.value);
            }
        case "float":
            return (ev: React.ChangeEvent<HTMLInputElement>) => {
                return parseFloat(ev.target.value);
            }
        default:
            throw new Error("Not a valid type.")
    }
}

class ListInput extends React.Component<ListInputProps, ListInputState> {

    constructor(props: ListInputProps) {
        super(props);
        this.state = {
            count: 0,
            onChanges: [],
        };
    }

    onAdd = () => {
        const newCount = this.state.count + 1;
        this.state.onChanges.push(this.props.onAdd());
        this.setState({count: newCount});
    }

    onRemove = () => {
        if (this.state.count > 0) {
            this.state.onChanges.pop();
            this.setState({count: this.state.count - 1});
        }
    }

    reset() {
        this.setState({count: 0, onChanges: []})
    }

    render() {
        return (
            <div className={"list-input-container"}>
                <h4 className={"list-input-title"}>
                    {this.props.title}&nbsp;:&nbsp;{this.state.count}
                </h4>
                <ul className={"items"}>
                    {
                        this.state.onChanges.map((fun, index) => {
                            return (
                                <li
                                    key={index}
                                    className={"item"}
                                >
                                    {
                                        Object.keys(this.props.item).map((ikey, iindex) => {
                                            const JSType = this.props.item[ikey];
                                            const convFunc = HTMLValueConverter(JSType);
                                            const data: { [entry: string]: any } = {};
                                            const onChange = this.state.onChanges[index];
                                            return (
                                                <input
                                                    key={index + ":" + iindex}
                                                    type={"string"}
                                                    placeholder={`Enter ${ikey} Here . . .`}
                                                    onChange={(ev) => {
                                                        data[ikey] = convFunc(ev);
                                                        onChange(data);
                                                    }}
                                                />
                                            );
                                        })
                                    }
                                </li>
                            );
                        })
                    }
                    <div className={"button-container"}>
                        <button
                            className={"remove"}
                            onClick={this.onRemove}
                        > -
                        </button>
                        &nbsp;
                        <button
                            className={"add"}
                            onClick={this.onAdd}
                        > +
                        </button>
                    </div>
                </ul>
            </div>
        );
    }
}

interface CreateProps {
    error: string,
    enabled: boolean
    onClick: () => any
}

class Create extends React.Component<CreateProps, {}> {

    constructor(props: CreateProps) {
        super(props);
        this.state = {
            error: props.error,
            enabled: props.enabled,
            onClick: () => {
            }
        }
    }

    render() {
        return (
            <div className={"clearfix create-container"}>
                <p className={"error-output"}>
                    {this.props.error}
                </p>
                <button className={"create"} disabled={!this.props.enabled} onClick={this.props.onClick}>
                    Create
                </button>
            </div>
        );
    }

    reset() {
        this.setState({error: "No errors!", enabled: true})
    }

    setError(error: string) {
        this.setState({error: error});
    }

    setEnabled(enabled: boolean) {
        this.setState({enabled: enabled});
    }

}

function updateObject(obj: any, data: { [key: string]: string }) {
    Object.keys(data).forEach(key => {
        if (key in obj) {
            obj[key] = data[key];
        }
    });
}

interface NewSystemDataModel {
    systemName: string;
    glyphs: string;
    tags: { tag: string }[];
    buy: Item[];
    sell: Item[];
    error: string;
}

interface CreatorProps {
    systems: SystemData[];
    onCreate: (obj: NewSystemDataModel) => any;
}

class Creator extends React.Component<CreatorProps, NewSystemDataModel> {

    snRef: React.RefObject<HTMLInputElement>;
    gRef: React.RefObject<HTMLInputElement>;
    tRef: React.RefObject<ListInput>;
    bRef: React.RefObject<ListInput>;
    sRef: React.RefObject<ListInput>;
    cRef: React.RefObject<Create>;

    constructor(props: CreatorProps) {
        super(props);
        this.state = {
            systemName: "",
            glyphs: "",
            tags: [],
            buy: [],
            sell: [],
            error: "No errors!"
        };
        this.snRef = React.createRef();
        this.gRef = React.createRef();
        this.tRef = React.createRef();
        this.bRef = React.createRef();
        this.sRef = React.createRef();
        this.cRef = React.createRef();
    }

    reset = () => {
        this.setState({
            systemName: "",
            glyphs: "",
            tags: [],
            buy: [],
            sell: []
        });
        this.tRef.current?.reset();
        this.bRef.current?.reset();
        this.sRef.current?.reset();
        this.cRef.current?.reset();
    }

    invalidItem = (item: Item) => {
        return item.name === "" || item.name === undefined || item.name === null
            || item.price === 0 || item.price === undefined || item.price === null
            || item.percent === 0 || item.percent === undefined || item.percent === null;
    }

    create = () => {
        if (this.state.systemName === "") {
            this.setState({error: "The system must have a name."})
        } else if (this.props.systems.some(system => system.name === this.state.systemName)) {
            this.setState({error: "System name is not unique."})
        } else if (this.state.buy.length === 0 && this.state.sell.length === 0) {
            this.setState({error: "No items have been added to system."})
        } else if (this.state.buy.some(this.invalidItem) || this.state.sell.some(this.invalidItem)
        ) {
            this.setState({error: "All items must have a name, price and percent."})
        } else if(new Set(this.state.buy).size !== this.state.buy.length
            || new Set(this.state.sell).size !== this.state.sell.length
        ) {
            this.setState({error: "All item name in a system must be unique."})
        } else {
            this.props.onCreate(this.state);
            this.reset();
        }
    }

    render() {
        return (
            <div className={"creator right"}>
                <h2 className={"section-title title"}>
                    New System
                </h2>
                <div className={"new-system"}>
                    <input
                        type={"text"}
                        placeholder={"Enter System Name Here . . ."}
                        className={"form-margin"}
                        ref={this.snRef}
                        value={this.state.systemName}
                        onChange={ev => this.setState({systemName: ev.target.value})}
                    />
                    <input
                        type={"text"}
                        placeholder={"Enter Glyphs Here . . ."}
                        className={"form-margin"}
                        ref={this.gRef}
                        value={this.state.glyphs}
                        onChange={ev => this.setState({glyphs: ev.target.value})}
                    />
                    <ListInput
                        title={"System Tags"}
                        item={{
                            "tag": "string"
                        }}
                        ref={this.sRef}
                        onAdd={() => {
                            const item = {"tag": ""};
                            this.state.tags.push(item);
                            return (update: { [key: string]: string }) => {
                                updateObject(item, update);
                            };
                        }}
                        onRemove={() => {
                            this.state.tags.pop()
                        }}
                    />
                    <ListInput
                        title={"Resources to Buy"}
                        item={{
                            "name": "string",
                            "price": "int",
                            "percent": "float"
                        }}
                        ref={this.bRef}
                        onAdd={() => {
                            const item = {"name": "", price: 0, percent: 0};
                            this.state.buy.push(item);
                            return (update: { [key: string]: string }) => {
                                updateObject(item, update);
                            };
                        }}
                        onRemove={() => {
                            this.state.buy.pop()
                        }}
                    />
                    <ListInput
                        title={"Resources to Sell"}
                        item={{
                            "name": "string",
                            "price": "int",
                            "percent": "float"
                        }}
                        ref={this.sRef}
                        onAdd={() => {
                            const item = {"name": "", price: 0, percent: 0};
                            this.state.sell.push(item);
                            return (update: { [key: string]: string }) => {
                                updateObject(item, update);
                            };
                        }}
                        onRemove={() => {
                            this.state.sell.pop()
                        }}
                    />
                    <Create
                        error={this.state.error}
                        enabled={true}
                        ref={this.cRef}
                        onClick={this.create}
                    />
                </div>
            </div>
        );
    }
}

interface PopupProps {
    title: string;
    text: string;
    buttons: { text: string, action: () => any }[];
}

interface PopupState {
    display: boolean;
}

class Popup extends React.Component<PopupProps, PopupState> {

    constructor(props: PopupProps) {
        super(props);
        this.state = {
            display: false
        };
    }

    open = () => {
        this.setState({display: true})
    }

    close = () => {
        this.setState({display: false})
    }

    render() {
        return (
            <div
                id={"popup"}
                className={ this.state.display ? "popup" : "none"}
                onClick={ev => {
                    if ((ev.target as any).id === "popup") {
                        this.close();
                    }
                }}
            >
                <div className={"popup-content"}>
                    <h1> {this.props.title} </h1>
                    <p> {this.props.text} </p>
                    <div className={"popup-buttons"}>
                        {
                            [...this.props.buttons, {text: 'Done', action: this.close}]
                                .map((button, index) => {
                                return (
                                    <button
                                        key={index}
                                        onClick={button.action}
                                        className={"popup-button"}
                                    >
                                        {button.text}
                                    </button>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }

}

interface AppState {
    systems: SystemData[];
    search: string;
}

class App extends React.Component<{}, AppState> {

    pRef: React.RefObject<Popup>;

    constructor(props: {}) {
        super(props);
        this.pRef = React.createRef<Popup>();
        let systemsS = localStorage.getItem("systems");
        let systems;
        if (systemsS) {
            systems = JSON.parse(systemsS);
        } else {
            systems = [];
        }
        this.state = {
            systems: systems,
            search: ""
        };
    }

    search = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({search: event.target.value.toLowerCase()});
    }

    remove = (name: string) => {
        const systems = this.state.systems.filter(system => system.name !== name);
        localStorage.setItem("systems", JSON.stringify(systems));
        this.setState({systems: systems});
    }

    render() {
        return (
            <div className={"app white"}>
                <h1 className={"title site-title"}>
                    <button
                        className={"settings"}
                        onClick={() => this.pRef.current?.open()}
                    >
                        <span role="img" aria-label="settings"> ⚙️ </span>️
                    </button>
                    No Man's Sky Market Database
                </h1>
                <div className={"main"}>
                    <div className={"created left"}>
                        <div className={"search"}>
                            <input
                                type={"text"}
                                placeholder={"Enter Item Name Here . . ."}
                                onChange={this.search}
                            />
                        </div>
                        <div className={"market"}>
                            <div className={"buy left"}>
                                <h2 className={"section-title title"}>
                                    Buy
                                </h2>
                                <div className={"systems"}>
                                    {
                                        this.state.systems
                                            .filter(system =>
                                                system.buy.some(item =>
                                                    item.name.toLowerCase().indexOf(this.state.search) !== -1))
                                            .map((system, index) =>
                                                System.fromSystemData(system, this.remove, true, false, index))
                                    }
                                </div>
                            </div>
                            <div className={"sell right"}>
                                <h2 className={"section-title title"}>
                                    Sell
                                </h2>
                                <div className={"systems"}>
                                    {
                                        this.state.systems
                                            .filter(system =>
                                                system.sell.some(item =>
                                                    item.name.toLowerCase().indexOf(this.state.search) !== -1))
                                            .map((system, index) =>
                                                System.fromSystemData(system, this.remove, false, true, index))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <Creator
                        systems={this.state.systems}
                        onCreate={nsdm => {
                            const systems = [...this.state.systems,
                                {
                                    name: nsdm.systemName,
                                    glyphs: nsdm.glyphs,
                                    tags: nsdm.tags.map(tag => tag.tag),
                                    buy: nsdm.buy,
                                    sell: nsdm.sell
                                }
                            ];
                            localStorage.setItem("systems", JSON.stringify(systems));
                            this.setState({systems: systems});
                        }}
                    />
                </div>
                <Popup
                    title={"Options"}
                    text={
                        "Save will save your systems to a file locally. " +
                        "Load will add all of the systems in a given file to your local DB. " +
                        "Clear will delete all entries from your local DB. " +
                        "Done will close this popup."
                    }
                    buttons={
                        [
                            {
                                text: "Save",
                                action: () => {
                                    const blob = new Blob(
                                        [localStorage.getItem("systems") as string],
                                        {type: 'text/json'}
                                    );
                                    if (window.navigator.msSaveOrOpenBlob as unknown) {
                                        window.navigator.msSaveBlob(blob, "NoMansSkySystemDB.json");
                                    } else {
                                        const elem = window.document.createElement('a');
                                        elem.href = window.URL.createObjectURL(blob);
                                        elem.download = "NoMansSkySystemDB.json";
                                        document.body.appendChild(elem);
                                        elem.click();
                                        document.body.removeChild(elem);
                                    }
                                }
                            },
                            {
                                text: "Load",
                                action: () => {
                                    // open file dialog
                                    // validate is json, validate each system
                                    // let user know of success or failure
                                    const blob = new Blob();
                                    if (window.navigator.msSaveOrOpenBlob as unknown) {
                                        window.navigator.msSaveOrOpenBlob(blob);
                                    } else {
                                        const elem = window.document.createElement('input');
                                        elem.type = "file";
                                        elem.onchange = () => {
                                            if (elem.files) {
                                                const fr = new FileReader();
                                                fr.onloadend = () => {
                                                    if (fr.error) {
                                                        alert("File upload failed. File Reader was not able to read file.")
                                                    } else {
                                                        try {
                                                            const data = JSON.parse(fr.result as string);
                                                            console.log(data)
                                                            if (verifyData(data)) {
                                                                const systems = [...this.state.systems, ...data.systems];
                                                                localStorage.setItem("systems", JSON.stringify(systems));
                                                                this.setState({systems: systems});
                                                            } else {
                                                                alert("The file that you uploaded is invalid.")
                                                            }
                                                        } catch (e) {
                                                            console.log(e)
                                                            alert("The file that you uploaded could not be parsed. Try uploading a different file.")
                                                        }
                                                    }
                                                };
                                                fr.readAsText(elem.files[0]);
                                            }
                                        }
                                        document.body.appendChild(elem);
                                        elem.click();
                                        document.body.removeChild(elem);
                                    }
                                }
                            },
                            {
                                text: "Clear",
                                action: () => {
                                    localStorage.clear();
                                    this.setState({systems: []});
                                }
                            }
                        ]
                    }
                    ref={this.pRef}
                />
            </div>
        );

    }
}

export default App;

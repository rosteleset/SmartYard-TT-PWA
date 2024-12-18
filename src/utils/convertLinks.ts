import linkifyHtml from "linkify-html";

function convertLinks(text: string) {
    const options = {
        defaultProtocol: "https",
        target: "_blank",
    };
    return linkifyHtml(text, options);
}

export default convertLinks;

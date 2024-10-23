import api from "@/utils/api";

const useCdr = () => {

    const hasCdr = (issue: DetailIssue) => {
        return issue && ((issue._cf_object_id && 500000000 <= parseInt(issue._cf_object_id) && parseInt(issue._cf_object_id) < 600000000) || issue._cf_phone);
    }

    const cdr = (issue: DetailIssue) => {
        return api.GET('custom/custom', {
            action: 'client_info',
            client_id: `${parseInt(issue._cf_object_id) - 500000000}`,
        })
            .then(result => {
                let phones = [];
                for (let i in result.custom.phones) {
                    if (result.custom.phones[i].raw.length == 11) {
                        phones.push("7" + result.custom.phones[i].raw.substring(1));
                        phones.push("8" + result.custom.phones[i].raw.substring(1));
                    }
                    phones.push("9" + result.custom.phones[i].phone_id.padStart(6, "0"));
                }
                if (issue._cf_phone && issue._cf_phone[0] != "[") {
                    phones.push("7" + issue._cf_phone.substring(1));
                    phones.push("8" + issue._cf_phone.substring(1));
                }
                if (issue._cf_bank_details) {
                    let b = issue._cf_bank_details.split("\n");
                    if (b[3]) {
                        phones.push("7" + b[3].substring(1));
                        phones.push("8" + b[3].substring(1));
                    }
                }

                return api.POST('cdr/cdr', {
                    phones: phones,
                    dateFrom: (issue.created ? issue.created : (new Date()).getTime() / 1000) - 24 * 60 * 60,
                    dateTo: (issue._cf_close_date ? issue._cf_close_date : (new Date()).getTime() / 1000) + 24 * 60 * 60,
                })
            });
    }

    return {
        hasCdr,
        cdr
    }
}

export default useCdr
import {
    getDataIcon
} from "./utils.js"

// Updates the table of logs for the replicas.
class TableUpdater {
    constructor(tableEl, numReplicas) {
        this.tableEl = tableEl;
        this.numReplicas = numReplicas;
    }

    updateCommitIndex(replica, index) {
    }

    insertValue(replica, index, term, value) {
        index++;
        var row = this.tableEl.rows[index];
        if (!row) {
            row = this.tableEl.insertRow(index);
            for (var i = 0; i < this.numReplicas; i++) {
                row.insertCell(i);
            }
        }
        var cell = row.cells[replica];

        var svg = d3.select(cell).append("img")
            .attr("class", "table-data")
            .attr("src", getDataIcon(value));

        var termData = document.createElement("div");
        termData.textContent = term;
        termData.classList.add("table-term");
        cell.appendChild(termData);
    }
}

export {
    TableUpdater
}

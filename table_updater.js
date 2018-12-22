import {
    getDataIcon
} from "./utils.js"

// Updates the table of logs for the replicas.
class TableUpdater {
    constructor(numReplicas) {
        this.tableEl = $("#logs-table-body")[0];
        this.numReplicas = numReplicas;
    }

    updateCommitIndex(replica, index) {
        for (var i = 0; i <= index; i++) {
            var row = this.tableEl.rows[i];
            if (!row) {
                throw Error("Cannot commit an index that is not in table.");
            }

            var replicaCell = row.cells[replica];
            replicaCell.classList.add("committed");
        }
    }

    insertValue(replica, index, term, value) {
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

    purgeValues(replicaId, newLength, oldLength) {
        for (var i = newLength; i < oldLength; i++) {
            var row = this.tableEl.rows[i];
            if (!row) {
                throw Error("Failed to purge values for " + replicaId +
                    " from " + newLength + " to " + oldLength +
                    ": row missing at index " + i);
            }
            var cell = row.cells[replicaId];
            while (cell.firstChild) {
                cell.removeChild(cell.firstChild);
            }
        }
    }
}

export {
    TableUpdater
}
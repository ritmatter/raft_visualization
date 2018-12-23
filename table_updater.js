import {
    getDataIcon
} from "./utils/utils.js"

// Updates the table of logs for the replicas.
class TableUpdater {
    constructor(numReplicas) {
        this.tableEl = $("#logs-table-body")[0];
        this.numReplicas = numReplicas;
    }

    init() {
      var row = this.tableEl.insertRow(0);
      for (var j = 0; j < this.numReplicas; j++) {
        row.insertCell(j);
      }
    }

    updateCommitIndex(replica, commitIndex) {
        for (var i = 0; i <= commitIndex; i++) {
            var index = this.tableEl.rows.length - 1 - i;
            var row = this.tableEl.rows[index];
            if (!row) {
                throw Error("Cannot commit an index that is not in table.");
            }

            var replicaCell = row.cells[replica];
            replicaCell.classList.add("committed");
        }
    }

    insertValue(replica, index, term, value) {
        var i = this.tableEl.rows.length - 1 - index;

        var row;
        if (i < 0) {
          // Add a new row at the front of the table.
          row = this.tableEl.insertRow(0);
          for (var j = 0; j < this.numReplicas; j++) {
              row.insertCell(j);
          }
        } else {
          // Put the data in the existing row.
          row = this.tableEl.rows[i];
          if (!row) {
            throw Error("Attempting to overwrite cell in missing row");
          }
        }

        var cell = row.cells[replica];
        if (cell.hasChildNodes()) {
          throw Error("Attempting to put data in non-empty cell");
        }

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
            var index = this.tableEl.rows.length - i - 1;
            var row = this.tableEl.rows[index];
            if (!row) {
                throw Error("Failed to purge values for " + replicaId +
                    " from " + newLength + " to " + oldLength +
                    ": row missing at index " + index);
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

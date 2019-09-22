const models = [
  { id: 1, title: 'Fish Sim', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
  { id: 2, title: 'Tank Sim', groupId: 'gr05', dateCreated: '', dateModified: '', data: '' },
  { id: 3, title: 'Ammonia', groupId: 'gr01', dateCreated: '', dateModified: '', data: '' },
  { id: 4, title: 'Fish Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
  { id: 5, title: 'Tank Sim', groupId: 'gr02', dateCreated: '', dateModified: '', data: '' },
  { id: 6, title: 'Fish Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
  { id: 7, title: 'No Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
  { id: 8, title: 'Fish Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
  { id: 9, title: 'Tank Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
  { id: 10, title: 'Fish Sim', groupId: 'gr04', dateCreated: '', dateModified: '', data: '' },
  { id: 11, title: 'No Sim', groupId: 'gr05', dateCreated: '', dateModified: '', data: '' }
];

function getModel(id) {
  return models.find(element => element.id === id);
}

// HARDCODED MODEL LOAD
let model = getModel(1);
model.data = require(`./models/mo01.db`);

// HARDCODED MODEL LOAD
model = getModel(2);
model.data = require(`./models/mo02.db`);

module.exports = models;

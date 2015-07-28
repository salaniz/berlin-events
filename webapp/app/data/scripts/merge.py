import json, csv

with open('../events_location.json', 'r') as f:
    json_data = json.load(f)

csv_data = []
with open('../events.csv', 'r') as f:
    csv_reader = csv.DictReader(f)
    for row in csv_reader:
        csv_data.append(row)

print csv_data[0].keys()
print json_data[0].keys()
merged_data = []
i = 0
print len(json_data)
print len(csv_data)
del csv_data[0]
print len(csv_data)
for csv_e, json_e in zip(csv_data, json_data):
    merged_dict = {}
    merged_dict['id'] = csv_e['id']
    merged_dict['county'] = csv_e['bezirk']
    merged_dict['name'] = csv_e['bezeichnung']
    merged_dict['location'] = csv_e['strasse']
    merged_dict['from'] = csv_e['von']
    merged_dict['to'] = csv_e['bis']
    merged_dict['time'] = csv_e['zeit']
    merged_dict['host'] = csv_e['veranstalter']
    merged_dict['tel'] = csv_e['Tel']
    merged_dict['fax'] = csv_e['Fax']
    merged_dict['mail'] = csv_e['mail']
    merged_dict['website'] = csv_e['www']
    merged_dict['comments'] = csv_e['bemerkungen']
    merged_dict['fee'] = csv_e['Eintrittspreis']
    if 'postcode' in json_e['address']:
        merged_dict['zip'] = json_e['address']['postcode']
    else:
        merged_dict['zip'] = csv_e['plz']
    merged_dict['lon'] = json_e['lon']
    merged_dict['lat'] = json_e['lat']
    merged_data.append(merged_dict)

with open('../events.json', 'w') as out:
    json.dump(merged_data, out)

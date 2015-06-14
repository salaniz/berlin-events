import urllib2, re, json, time

entries = []

errors = []
for line in open('../streetdata_final.csv', ):
    words = line.split('" "')
    address = ', '.join(words[1:])
    address = re.sub(r'[\"|\n]', '', address)
    print words[0], address
    address = urllib2.quote(address)
    url = ('http://nominatim.openstreetmap.org/search/de/?q={}&format=json&'
           'limit=1&addressdetails=1&'
           '\email=mihailbogojeski@gmail.com').format(address)
    print url
    response = urllib2.urlopen(url)
    data = json.load(response)
    print data
    if not data:
        errors.append(words[0] + ' ' + address)
    entries += data
    with open('events.json', 'w') as out:
        json.dump(entries, out)
        out.close()
    time.sleep(1)

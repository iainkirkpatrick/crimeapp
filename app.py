import web

#define variables containing text for questions - CHANGE THESE if the questions change
q1 = 'STEP 1: Click on the locations in Christchurch where you think crime is high. Click on at least one place!'
q2 = 'STEP 2: Mark the locations where you feel unsafe walking at night by clicking on the map to the left. Click on at least one location!'
q3 = "STEP 3: Mark the area in which you live by clicking on the map to the left. If you don't live in Wellington please use the dropdown box below to identify where you come from"

urls = (
'/', 'test_leaflet',
'/core.html', 'core'
)
render = web.template.render('templates/')

app = web.application(urls, globals())

class test_leaflet:
	def GET(self):
		#some code when welcome class is requested via matching URL
		#return something (welcome HTML template)
		return render.test_leaflet(q1, q2, q3)
	
	#def POST(self):
		#some code when posting data to this URL
		#return something

class core:
	def GET(self):
		return render.core()

if __name__ == '__main__': # unsure, some kind of validation check
	app.run()

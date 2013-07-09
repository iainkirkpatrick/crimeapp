import web
from web import form

#define variables containing text for questions - CHANGE THESE if the questions change
q1 = "STEP 1: Click on the locations in Wellington where you think crime is high. Click on at least one place!"
q2 = "STEP 2: Mark the locations where you feel unsafe walking at night by clicking on the map to the left. Click on at least one location!"
q3 = "STEP 3: Mark the area in which you live by clicking on the map to the left. If you don't live in Wellington please use the dropdown box below to identify where you come from"
q4 = "STEP 4: Answer the questions below:"

# questionaire variables if doing them by simple string style
q4a = "Gender:"
q4b = "Age group:"
q4c = "Occupation:"
q4d = "Income:"
q4e = "Education:"
q4f = "Ethnicity:"
q4g = "Have you been a victim of crime:"
q4h = "Are you worried about crime in Wellington:"
q4i = "Comments:"

#text for q4 (questionaire). JSON?
## q4questions = ['Name:', 'Gender:']

urls = (
'/', 'test_leaflet',
'/core.html', 'core'
)
render = web.template.render('templates/')

app = web.application(urls, globals())

#questionaire form (may not be used as it may be preferable to just build form in HTML)
# myForm = form.Form(
#     form.Textbox('Name'),
# 	form.Radio('Gender', [('male', 'Male'), ('female', 'Female')]),
#     form.Button('Submit'),
# )

class test_leaflet:
	def GET(self):
		#questionaire = myForm()
		#some code when test_leaflet class is requested via matching URL
		#return something (test_leaflet HTML template)
		return render.test_leaflet(q1, q2, q3, q4)
	
	#def POST(self):
		#some code when posting data to this URL
		#return something

class core:
	def GET(self):
		return render.core()

if __name__ == '__main__': # unsure, some kind of validation check
	app.run()

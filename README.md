# Portfolio Django Project

Welcome to **Portfolio Django**, a comprehensive Django-based application for managing and displaying user preferences, tourism-related data, and results. This README will guide you through setting up, running, and interacting with the project.

---

## **Application URLs**
Here are the key URLs for accessing different parts of the application:

- **Homepage:** [http://127.0.0.1:8000/portfolio/pfl_app/homepage](http://127.0.0.1:8000/portfolio/pfl_app/homepage)  
- **RAG:** [http://127.0.0.1:8000/portfolio/pfl_app/rag](http://127.0.0.1:8000/portfolio/pfl_app/rag)  
- **Results Page:** [http://127.0.0.1:8000/portfolio/results](http://127.0.0.1:8000/portfolio/pfl_app/results)  

---

## **How to Run the Project**

Start the Cloud SQL Auth Proxy:
```bash
cloud-sql-proxy.exe nice-lodge-443310-b1:us-central1:city-matches ^
    --credentials-file="C:\cloud_sql_proxy\application_default_credentials.json"
```

Follow the steps below to activate the environment and start the server.

### **1. Activate the Virtual Environment**
In the terminal, navigate to the project folder and activate the virtual environment:
```bash
portfolio_env\Scripts\activate
```

### **2. Start the Server**
Run the Django development server:
```bash
python manage.py runserver
```

Once the server is running, you can access the application in your browser using the URLs listed above.

---

## **Database Information**

### **Database Location**
The project uses an SQLite database, located at:
```
E:\data_science\portfolio\db.sqlite3
```

### **How to View and Query the Data**

#### **Option 1: DB Browser for SQLite**
Use [DB Browser for SQLite](https://sqlitebrowser.org/) for a user-friendly way to browse and edit the database:
1. Download and install DB Browser for SQLite.
2. Open the application and load the `db.sqlite3` file.
3. View and manage the data visually.

#### **Option 2: Django Shell**
Use the Django shell to interact with the database programmatically:
1. Navigate to the project directory:
   ```bash
   cd E:\data_science\portfolio
   ```
2. Start the Django shell:
   ```bash
   python manage.py shell
   ```
3. Query the `UserPreference` model:
   ```python
   from pfl_app.models import UserPreference
   preferences = UserPreference.objects.all()
   for preference in preferences:
       print(preference.geographical_features, preference.tourist_activities, preference.tour_month)
   ```

---

## **Additional Notes**
- Ensure all dependencies are installed using:
  ```bash
  pip install -r requirements.txt
  ```
- If you encounter any issues, double-check the database and application settings in `settings.py`.

---

## **Contributing**
If you'd like to contribute, feel free to fork the repository, make your changes, and submit a pull request. We welcome contributions that improve the functionality or fix issues.

---

## **License**
This project is open-source and available under the [MIT License](LICENSE). 

---

Enjoy using **Portfolio Django**! 🎉
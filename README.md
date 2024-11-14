# porfolio_django
# porfolio_django
# porfolio_django

URL to homepage: http://127.0.0.1:8000/portfolio/pfl_app/homepage
URL to rag: http://127.0.0.1:8000/portfolio/pfl_app/rag
http://127.0.0.1:8000/portfolio/pfl_app/results

Commands to start:
E:\data_science\portfolio>portfolio_env\Scripts\activate

(portfolio_env) E:\data_science\portfolio>python manage.py runserver
-----------
portfolio_env\Scripts\activate
python manage.py runserver

To view the data stored in `db.sqlite3` at `E:\data_science\portfolio\db.sqlite3`, you have several options. Here are some common methods:

### 3. **Using Django Shell**

Another method is to use Django's interactive shell to query the database. This will use Django’s ORM to access the data.

1. Open your terminal or command prompt.
2. Navigate to your project directory (where `manage.py` is located):

   ```bash
   cd E:\data_science\portfolio
   ```

3. Launch the Django shell:

   ```bash
   python manage.py shell
   ```

4. In the shell, you can query the `UserPreference` model like this:

   ```python
   from pfl_app.models import UserPreference
   preferences = UserPreference.objects.all()
   for preference in preferences: print(preference.geographical_features, preference.tourist_activities, preference.tour_month)
   ```

This will display the preferences data that has been saved to the database.

---

If you're looking for an easy way to browse the database, I recommend using **DB Browser for SQLite** since it's user-friendly and provides a visual interface to interact with the database.
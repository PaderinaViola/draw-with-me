from django.db import models

class Drawing(models.Model):
    title = models.CharField(max_length=1000)
    data = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
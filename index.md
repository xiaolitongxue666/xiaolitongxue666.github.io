- {% for post in site.posts %}

- {{ post.title }}

  . {{ post.date | date: '%B %d, %Y' }}.

  {{ post.abstract }}

- {% endfor %}
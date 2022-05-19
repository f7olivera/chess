from django import forms
from django import template

register = template.Library()


class NewGameForm(forms.Form):
    opponent = forms.CharField(label="",
                               widget=forms.TextInput(attrs={"placeholder": "Oponent username",
                                                             "disabled": "true",
                                                             "oninput": "validateUser()"}),
                               required=False)
    share_link = forms.BooleanField(label="Share link to play",
                                    widget=forms.CheckboxInput(attrs={"checked": "true",
                                                                      "onchange": "changeOponent()"}),
                                    required=False)

    CHOICES = [('real', 'Real time'), ('unlimited', 'Unlimited')]
    time_mode = forms.CharField(widget=forms.Select(choices=CHOICES, attrs={"onchange": "changeTimeMode(self.value)"}))
    time = forms.FloatField(label="",
                            widget=forms.NumberInput(attrs={"type": "number",
                                                            "value": "10",
                                                            "min": "0",
                                                            "max": "180",
                                                            "step": "any",
                                                            "style": "display: none;"}))
    starting_fen = forms.CharField(max_length=90,
                                   label="",
                                   widget=forms.TextInput(attrs={
                                       "placeholder": "Starting position",
                                       "value": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"}))
    white_player = forms.CharField(label="",
                                   widget=forms.TextInput(attrs={"placeholder": "white player"}))

    def clean(self):
        opponent = self.cleaned_data.get('opponent')
        with_link = self.cleaned_data.get('with_link')
        if not opponent and not with_link:
            with_link = 'true'
        return self.cleaned_data


@register.simple_tag
def create_new_form():
    return NewGameForm()

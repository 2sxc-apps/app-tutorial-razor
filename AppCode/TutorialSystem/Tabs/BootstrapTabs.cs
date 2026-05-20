using ToSic.Razor.Blade;
using ToSic.Razor.Html5;
using ToSic.Razor.Markup;
using System.Collections.Generic;
using AppCode.Data;
using ToSic.Sxc.Edit.Toolbar;
using System.Linq;

// 2sxclint:disable:no-Presentation-in-quotes - it's just used as a css-class below

// Shared / re-used code to create bootstrap tabs

namespace AppCode.TutorialSystem.Tabs
{
  public class BootstrapTabs: Custom.Hybrid.CodeTyped
  {
    private const string Indent = "    ";
    private const string IndentLi = "      ";
    private const string IndentBtn = "        ";

    public ITag TabList(TutorialSnippet item, string prefix, List<TabSpecs> tabs, TabSpecs active) /* string active = null) */ {
      var tabList = tabs
        .SelectMany((tab, index) => {
          // first entry is active = true
          var isActive = (active == null && index == 0) || tab.DisplayName == active.DisplayName;

          // Generate button, and toolbar to edit/create the add-on definition
          var tlb = GenerateTabToolbar(tab, item);
          var tabLi = TabLi(tab, prefix, isActive).Attr(tlb);

          return new object[] { 
            "\n\n" + IndentLi + "<!-- Tab '" + tab.DisplayName + "'-->",
            "\n" + IndentLi,
            tabLi,
          };
        })
        .ToList();

      return Tag.RawHtml(
        "\n" + Indent + "<!-- TabList Start '" + prefix + "'-->\n",
        Indent,
        Tag.Ul().Class("nav nav-pills p-3 rounded-top border")
          .Attr("role", "tablist")
          .Wrap(tabList),
        "\n" + Indent + "<!-- TabList End '" + prefix + "'-->\n"
      );
    }

    private IToolbarBuilder GenerateTabToolbar(TabSpecs tab, TutorialSnippet item)
    {
      // Special check: these buttons could appear in the UI for anonymous
      // as a side-effect of the demo-mode.
      // It's not quite clear why, as the demo-mode should be disabled
      // but it's probably a timing issue, when the disabled is triggered again etc.
      // So we're doing an extra check before adding the toolbar
      if (!MyUser.IsContentEditor)
        return null;
      
      if (tab.AddOn != null)
        return Kit.Toolbar.Edit(tab.AddOn);

      // Create a toolbar to convert the current code-based tab into an add-on, pre-filling the file path and type
      // But skip for Output-tabs
      if (tab.Type != TabType.Results
        && tab.Type != TabType.ResultsAndSource
        && tab.Type != TabType.Source
        && tab.Type != TabType.TutorialReferences
        && tab.Type != TabType.InDepth
      )
      {
        var tlb = Kit.Toolbar.Empty().New(
          item.AddOns,
          tweak: t => {
            // set new type
            t = t.Prefill(nameof(TutorialSnippetAddOn.AddOnType), tab.ToAddOnType());

            // 2026-05-20 2dm unclear what this was for, probably really just a test?
            // t = t.Prefill("test", tab.Type.ToString());

            // If code-based, prefill the title, otherwise prefill the file path
            if (tab.Type == TabType.FromCode)
              t = t.Prefill(nameof(TutorialSnippetAddOn.TabTitle), tab.Label);
            else if (tab.Type != TabType.ViewConfig)
              t = t.Prefill(nameof(TutorialSnippetAddOn.FilePath), tab.Value);
              
            return t;
          }
        );
        return tlb;
      }
      return null;
    }

    private Li TabLi(TabSpecs tab, string prefix, bool active) {
      return Tag.Li().Class("nav-item").Attr("role", "presentation").Wrap(
        "\n",
        IndentBtn + $"<!-- Tab button '{tab.Original}', type: {tab.Type} -->\n",
        IndentBtn,
        TabButton(prefix, tab.DisplayName, tab.DomId, active),
        "\n" + IndentLi
      );
    }

    private ITag TabButton(string prefix, string title, string name, bool selected) {
      var realId = prefix + name;
      return Tag.Button(title)
        .Class("nav-link " + (selected ? "active" : ""))
        .Id(prefix + "-tab")
        .Attr("data-bs-toggle", "tab")
        .Attr("data-bs-target", "#" + realId)
        .Type("button")
        .Attr("role", "tab")
        .Attr("aria-controls", realId)
        .Attr("aria-selected", selected.ToString().ToLower());
    }

    // private Div TabContentGroup() {
    //   return Tag.Div().Class("tab-content p-3 border border-top-0 bg-light mb-5");
    // }

    public object TabContentGroupOpen() {
      _tabContentGroupIsOpen = true;
      return Tag.RawHtml(
        "\n" + Indent + "<!-- TabContentGroupOpen -->\n",
        Indent,
        Tag.Div().Class("tab-content p-3 border border-top-0 bg-light mb-5").TagStart
      );
    }
    private bool _tabContentGroupIsOpen = false;

    public string TabContentGroupClose() {
      var result = _tabContentGroupIsOpen ? "</div>\n": null;
      _tabContentGroupIsOpen = false;
      return result;
    }

    private Div TabContentDiv(string prefix, string id, bool isActive = false) {
      var realId = prefix + id;
      return Tag.Div()
          .Class("tab-pane fade " + (isActive ? "show active" : ""))
          .Id(realId)
          .Attr("role", "tabpanel")
          .Attr("aria-labelledby", realId + "-tab");
    }

    public string TabContentOpen(string prefix, string id, bool isActive) {
      _tabContentIsOpen = true;
      return "\n" + Indent + "<!-- TabContentOpen -->\n"
        + Indent
        + TabContentDiv(prefix, id, isActive).TagStart
        + "\n";
    }
    private bool _tabContentIsOpen = false;
    public string TabContentClose() {
      if (!_tabContentIsOpen)
        return "\n" + Indent + "<!-- TabContentClose - already closed -->\n";
      _tabContentIsOpen = false;
      var result = _tabContentIsOpen ? "</div>": null;
      return "\n" + Indent + "<!-- TabContentClose -->\n"
        + Indent + "</div>" + "\n";
    }

    public ITag TabContent(string prefix, string id, object result, bool isActive) {
      return Tag.RawHtml(
        "\n" + Indent + "<!-- TabContent '" + prefix +"':'" + id + "' -->\n",
        Indent,
        TabContentDiv(prefix, id, isActive).Wrap(result),
        "\n",
        Indent + "<!-- /TabContent '" + prefix +"':'" + id + "' -->\n"
      );
    }

    // private string[] _moreTabNames;
    // 2023-09-12 2dm disabled, probably don't need any more
    // public string GetTabName(int index) {
    //   var l = Log.Call<string>("index:" + index);
    //   if (_moreTabNames == null || !_moreTabNames.Any()) return l("no names", "unknown");
    //   if (_moreTabNames.Length < index + 1) return l("index to high", "unknown");
    //   var name = _moreTabNames[index];
    //   Log.Add("name before optimization: '" + name + "'");
    //   return l(name, name);
    // }
  }
}
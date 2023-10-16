try {
      let firstTheme = true
      await replit.init({permissions: []})
      async function setTheme() {
        await replit.themes.getCurrentTheme().then(theme => {
          console.log(theme)
          for (const value in theme.values.global) {
            if (!value.startsWith('_')) {
              const cssVariableName = '--' + value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
              document.documentElement.style.setProperty(cssVariableName, theme.values.global[value])
            }
          }
        })
        if (!firstTheme) {
          await replit.messages.showNotice("Theme updated successfully for SnippetVault", 2000)
        }
        firstTheme = false
      }
      await setTheme()
      await replit.themes.onThemeChange(setTheme)

    } catch (err) {
      await replit.debug.error("Error with setting theme.", err);
    }

    let file = await replit.session.getActiveFile()
    let fileExt = null
    async function getUserSlug() {
      const currentUser = await replit.data.currentUser();
      const currentRepl = await replit.data.currentRepl();
      $("#slughere").text(currentRepl.repl.slug)
      return `${currentUser.user.username}/${currentRepl.repl.slug}`;
    }
    async function getUser() {
      const currentUser = await replit.data.currentUser();
      return `${currentUser.user.username}`;
    }
document.querySelectorAll(".usetabs").forEach(textarea => {
  var history = [];
  var redoStack = [];

textarea.addEventListener('keydown', function(e) {
    var start = this.selectionStart;
    var end = this.selectionEnd;

    if (e.key == 'Tab') {
        e.preventDefault();

        history.push({value: this.value, start: start, end: end});

        this.value = this.value.substring(0, start) +
            "  " + this.value.substring(end);

        this.selectionStart =
        this.selectionEnd = start + 2;

        redoStack = [];
      }
      
      if (e.ctrlKey && e.key == 'z') {
        e.preventDefault();

        if (history.length) {
          redoStack.push({value: this.value, start: this.selectionStart, end: this.selectionEnd});

          var lastState = history.pop();
          this.value = lastState.value;
          this.selectionStart = lastState.start;
          this.selectionEnd = lastState.end;
          }
      }

      if (e.ctrlKey && e.key == 'y') {
        e.preventDefault();

        if (redoStack.length) {
          history.push({value: this.value, start: this.selectionStart, end: this.selectionEnd});

          var redoState = redoStack.pop();
          this.value = redoState.value;
          this.selectionStart = redoState.start;
          this.selectionEnd = redoState.end;
        }
      }
  });
});
    (async () => {

      function generateSnippetId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      }

      const user_slug = await getUserSlug();
      const user = await getUser();

      let firstime = true

      // snippets  //
      function handleSnippetTitleRightClick(event, snippetTitle) {
        event.preventDefault();
        const contextMenu = document.getElementById("context-menu");
        contextMenu.style.display = "block";
        contextMenu.style.left = event.pageX + "px";
        contextMenu.style.top = event.pageY + "px";
        contextMenu.style.zIndex = 1000;
        contextMenu.querySelector("#edit-note").onclick = () => {
          editSnippet(snippetTitle);
          contextMenu.style.display = "none";
        };
        document.addEventListener("click", () => {
          contextMenu.style.display = "none";
        });
      }

      function handleSnippetCodeRightClick(event, snippetCode) {
        event.preventDefault();
        const contextMenu = document.getElementById("context-menu");
        contextMenu.style.display = "block";
        contextMenu.style.left = event.pageX + "px";
        contextMenu.style.top = event.pageY + "px";
        contextMenu.style.zIndex = 1000;
        contextMenu.querySelector("#edit-note").onclick = () => {
          editSnippetContent(snippetCode);
          contextMenu.style.display = "none";
        };
        document.addEventListener("click", () => {
          contextMenu.style.display = "none";
        });
      }

      function editSnippet(snippetTitle) {
        const snippetId = snippetTitle.data("id");
        const currentTitle = snippetTitle.text();
        const newTitle = prompt("Edit snippet title:", currentTitle);
        if (newTitle && newTitle !== currentTitle) {
          const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
          const snippetIndex = snippets.findIndex((snippet) => snippet.id === snippetId);
          if (snippetIndex > -1) {
            snippets[snippetIndex].title = newTitle;
            localStorage.setItem("snippets", JSON.stringify(snippets));
            displaySnippets();
          }
        }
      }


      async function editSnippetContent(snippetCode) {
        const snippetId = snippetCode.data("id");
        const currentCode = snippetCode.text();
        const currentLanguage = snippetCode.data("language");
        
        const currentTitle = snippetCode.parent().find(".snippet-title").text();
        const editSnippetTitle = $("#edit-snippet-title");
        editSnippetTitle.val(currentTitle);
        
        const editSnippetModal = $("#edit-snippet-modal");
        editSnippetModal.removeClass("hidden");

        const editSnippetTextarea = $("#edit-snippet-textarea");
        editSnippetTextarea.val(currentCode);

        const editSnippetLanguage = $("#edit-snippet-language");
        editSnippetLanguage.val(currentLanguage);

        $("#edit-snippet-save-btn").off("click");
        $("#edit-snippet-cancel-btn").off("click");

        $("#edit-snippet-cancel-btn").on("click", function () {
          editSnippetModal.addClass("hidden");
        });
        document.getElementById("edit-snippet-language").addEventListener("change", function () {
          const selectedLanguage = this.value;
          if (selectedLanguage === "other") {
            document.getElementById("custom-language-fields").style.display = "block";
          } else {
            document.getElementById("custom-language-fields").style.display = "none";
          }
        });

        
        $("#edit-snippet-save-btn").on("click", function () {
        const newTitle = editSnippetTitle.val();
        const newCode = editSnippetTextarea.val();
        const newLanguage = editSnippetLanguage.val() === 'current' ? currentLanguage : editSnippetLanguage.val();
        if (newCode && newCode !== currentCode || newLanguage != currentLanguage || newTitle != currentTitle) {
            const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
            const snippetIndex = snippets.findIndex((snippet) => snippet.id === snippetId);
            if (snippetIndex > -1) {
              snippets[snippetIndex].code = newCode;
              snippets[snippetIndex].language = newLanguage;
              snippets[snippetIndex].title = newTitle;
              localStorage.setItem("snippets", JSON.stringify(snippets));
              editSnippetModal.addClass("hidden");
              displaySnippets();
          }
        } else {
          replit.messages.showNotice("You didn't change anything!", 2000);
          editSnippetModal.addClass("hidden");
        }

        
       })
     }
      function mapFileExtensionToLanguage(fileExt) {
        const extensionToLanguageMap = {
          "jsx": "javascript",
          "tsx": "typescript",
          "cjs": "javascript",
          "mjs": "javascript",
          "js": "javascript",
          "ts": "typescript",
          "html": "xml",
          "xml": "xml",
          "svg": "xml",
          "css": "css",
          "scss": "scss",
          "less": "less",
          "styl": "stylus",
          "java": "java",
          "kt": "kotlin",
          "groovy": "groovy",
          "cpp": "cpp",
          "hpp": "cpp",
          "cc": "cpp",
          "c": "c",
          "h": "c",
          "rs": "rust",
          "php": "php",
          "py": "python",
          "rpy": "python",
          "pyw": "python",
          "cpy": "python",
          "gyp": "python",
          "gypi": "python",
          "rb": "ruby",
          "rbw": "ruby",
          "rake": "ruby",
          "gemspec": "ruby",
          "podspec": "ruby",
          "thor": "ruby",
          "irb": "ruby",
          "swift": "swift",
          "go": "go",
          "rs": "rust",
          "dart": "dart",
          "sql": "sql",
          "sh": "bash",
          "gql": "graphql",
          "nix": "nix"
        };
      
        return extensionToLanguageMap[fileExt] || 'txt';
      }
      $("#snippet-form").submit(function (event) {
        event.preventDefault();
        const title = $("#snippet-title").val();
        const code = $("#snippet-code").val();
        const detectedLanguageResult = hljs.highlightAuto(code);
        const detectedLanguage = detectedLanguageResult.language || 'txt';
        $("#snippet-title").val("");
        $("#snippet-code").val("");
        const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
        snippets.push({user_slug, title, code, language: detectedLanguage, id: generateSnippetId()});
        localStorage.setItem("snippets", JSON.stringify(snippets));
        displaySnippets();
      });
      
      $("#snippets-list").on("click", ".delete-snippet", function () {
        const snippetId = $(this).data("id");
        if (confirm("Are you sure you want to delete this snippet? This cannot be undone.")) {
          replit.messages.showNotice("Deleted the snippet", 2032)
          const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
          const filteredSnippets = snippets.filter((snippet) => snippet.id !== snippetId);
          localStorage.setItem("snippets", JSON.stringify(filteredSnippets));
          displaySnippets();
        }
      });

      function displaySnippets() {
        function highlightCodeSnippets() {
          document.querySelectorAll("pre.hljs").forEach((block) => {
            hljs.highlightElement(block);
          });
        }
        const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
        const snippetsList = $("#snippets-list");
        snippetsList.empty();

        // Sort snippets based on their properties
        snippets.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          if (a.last_copied && !b.last_copied) return -1;
          if (!a.last_copied && b.last_copied) return 1;
          if (a.last_copied > b.last_copied) return -1;
          if (a.last_copied < b.last_copied) return 1;
          return 0;
        });

        snippets.forEach(function (snippet) {
          const listItem = $('<li></li>');
          const snippetTitle = $('<span class="snippet-title" data-id="' + snippet.id + '"></span>');
          snippetTitle.text(snippet.title)
          const snippetCode = $('<pre class="snippet-code hljs" data-id="' + snippet.id + '" title="Click to copy the code" data-language="' + snippet.language + '"></pre>');

          snippetCode.text(snippet.code);
          snippetTitle.on("contextmenu", function (e) {
            e.preventDefault();
            handleSnippetTitleRightClick(e, $(this));
          });
          snippetCode.on("contextmenu", function (e) {
            e.preventDefault();
            handleSnippetCodeRightClick(e, $(this));
          });
          const snippetContentWrapper = $('<div class="snippet-content-wrapper"></div>');
          snippetContentWrapper.append(snippetTitle);
          snippetContentWrapper.append(snippetCode);
          listItem.append(snippetContentWrapper);
          listItem.append('<button class="delete-snippet align-middle" data-id="' + snippet.id + '" title="Delete"><i class="fas fa-trash-alt"></i></button>');
          listItem.append('<button class="edit-code-snippet align-middle" data-id="' + snippet.id + '" title="Edit"><i class="fas fa-pencil-alt"></i></button>');
          listItem.append('<button class="toggle-pin-snippet align-middle ' + (snippet.pinned ? 'pinned-button' : '') + '" data-id="' + snippet.id + '" title="' + (snippet.pinned ? 'Pinned - click to unpin' : 'Pin this snippet') + '">' + (snippet.pinned ? '<i class="fas fa-thumbtack pinned"></i>' : '<i class="fas fa-thumbtack"></i><i class="fas fa-times"></i>') + '</button><span class="click-to-copy"> ∙ Click the code to copy it </span>');
          snippetsList.append(listItem);
          highlightCodeSnippets();
          filterSnippets()
        });

      }

      $("#snippets-list").on('click', '.toggle-pin-snippet', function () {
        const snippetId = $(this).data('id');
        const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
        const snippetIndex = snippets.findIndex((snippet) => snippet.id === snippetId);
        if (snippetIndex > -1) {
          snippets[snippetIndex].pinned = !snippets[snippetIndex].pinned;
          localStorage.setItem("snippets", JSON.stringify(snippets));
          displaySnippets();
        }
      });
      $("#snippets-list").on('click', '.edit-code-snippet', function () {
        const snippetCode = $(this).closest("li").find(".snippet-code");
        editSnippetContent(snippetCode);
      });


      $("#snippets-list").on('click', '.snippet-code', function (event) {
        const code = $(this).text();
        const snippetId = $(this).data('id');
        navigator.clipboard.writeText(code).then(() => {
          replit.messages.showConfirm('Snippet copied', 2321);
          confetti({
            particleCount: 30,
            angle: 180,
            spread: 55,
            origin: { y: (event.clientY / window.innerHeight), x: (event.clientX / window.innerWidth) } 
          })
          confetti({
            particleCount: 30,
            angle: 0,
            spread: 55,
            origin: { y: (event.clientY / window.innerHeight), x: (event.clientX / window.innerWidth) } 
          })
          // Update the last_copied property for the copied snippet
          const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
          const snippetIndex = snippets.findIndex((snippet) => snippet.id === snippetId);
          if (snippetIndex > -1) {
            snippets[snippetIndex].last_copied = Date.now();
            localStorage.setItem("snippets", JSON.stringify(snippets));
            displaySnippets();
          }
        });
      });
      displaySnippets();

      async function filterSnippets() {
        file = await replit.session.getActiveFile()
        if (file !== null) {
          fileExt = file.split('.').pop();
        }
        const searchText = $("#snippet-search").val().toLowerCase();
        const filterLanguage = $("#snippet-filter-language").is(":checked");
        const notes = JSON.parse(localStorage.getItem("notes") || "{}");
        notes.filterByActiveLanguage = filterLanguage;
        localStorage.setItem("notes", JSON.stringify(notes));


        $("#snippets-list li").each(function () {
          const snippetTitle = $(this).find(".snippet-title").text().toLowerCase();
          const snippetCode = $(this).find(".snippet-code").text().toLowerCase();
          const snippetLanguage = $(this).find(".snippet-code").data("language");
          const currentlang = mapFileExtensionToLanguage(fileExt)
          const matchesSearch = snippetTitle.includes(searchText) || snippetCode.includes(searchText);
          const matchesLanguage = !filterLanguage || snippetLanguage === currentlang;

          if (matchesSearch && matchesLanguage) {
            $(this).show();
          } else {
            $(this).hide();
          }
        });
      }

      $("#snippet-search").on("input", filterSnippets);
      $("#snippet-filter-language").on("change", filterSnippets);
      replit.session.onActiveFileChange(filterSnippets)

      $("#controls-explanation-btn").on("click", function () {
        $("#instructions-modal").removeClass("hidden");
      });
      $("#instructions-modal-close-btn").on("click", function () {
        $("#instructions-modal").addClass("hidden");
      });
      $(document).on("click", function (event) {
        // Check if the click target is outside the instructions-modal-content
        if (
          !$(event.target).closest(".instructions-modal-content").length &&
          !$(event.target).is("#controls-explanation-btn")
        ) {
          $("#instructions-modal").addClass("hidden");
        }
      });
      $("#delete-all-data-btn").on("click", function () {
        if (confirm("Are you sure you want to delete all the data? This action cannot be undone.")) {
          localStorage.removeItem("notes")
          localStorage.removeItem("snippets")
          replit.messages.showNotice("All snippets were successfully deleted!", 3000)
          displaySnippets()
        } else {
          displaySnippets()
        }
      })

      function exportSnippets() {
        const snippets = JSON.parse(localStorage.getItem("snippets") || "[]");
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "snippetvault_snippets.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }

      async function importSnippets() {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.onchange = async (event) => {
          const file = event.target.files[0];
          const fileContent = await file.text();
          try {
              const importedSnippets = JSON.parse(fileContent);
              if (Array.isArray(importedSnippets)) {
                  const existingSnippets = JSON.parse(localStorage.getItem("snippets")) || [];
                  const allSnippets = existingSnippets.concat(importedSnippets);
                  localStorage.setItem("snippets", JSON.stringify(allSnippets));
                  displaySnippets();
                  replit.messages.showNotice("Snippets imported successfully!", 2000);
              } else {
                  replit.messages.showNotice("Invalid JSON file format.", 2000);
              }
          } catch (error) {
              replit.messages.showNotice("Error importing snippets: " + error.message, 4000);
          }
      };
      fileInput.click();
  }
      $("#export-snippets-btn").on("click", exportSnippets);
      $("#import-snippets-btn").on("click", importSnippets);

      const notes = JSON.parse(localStorage.getItem("notes") || "{}");
      const filterByActiveLanguage = notes.filterByActiveLanguage || false;
      $("#snippet-filter-language").prop('checked', filterByActiveLanguage);
})();